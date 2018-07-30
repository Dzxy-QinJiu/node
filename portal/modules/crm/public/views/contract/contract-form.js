import { Form, Input, Select, Icon, DatePicker} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
import DetailCard from 'CMP_DIR/detail-card';
import SelectAppList from 'CMP_DIR/select-app-list';
import { AntcTable } from 'antc';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
const removeCommaFromNum = antUtilsNum.removeCommaFromNum;
import ContractAction from '../../action/contract-action';
const UserData = require('PUB_DIR/sources/user-data');
const ContractAjax = require('../../ajax/contract-ajax');

const Contract = React.createClass( {
    getInitialState() {
        return {
            isLoading: false,
            errorMsg: '',
            visible: false, // 是否显示应用选择项
            isShowSelectAppTable: false, // 是否显示应用表格
            selectAppList: [], // 选择的应用列表
            contractType: '产品合同', // 合同类型
            formData: JSON.parse(JSON.stringify(this.props.contract)), // 合同信息
            products: [], // 产品数据
        };
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.currentId !== this.props.currentId) {
            this.state.formData.customerName = nextProps.curCustomer.name;
            this.setState({});
        }
    },
    handleSureBtn() {
        this.setState({
            isShowSelectAppTable: true,
            visible: false,
            products: this.getSelectAppListData()
        });
    },
    handleCancelBtn(){
        this.setState({
            visible: false
        });
    },
    // 获取选中的应用列表
    getSelectAppList(selectAppList) {
        this.setState({
            selectAppList: selectAppList
        });
    },
    renderAppSelectPanel() {
        return (
            <div className='app-select-list-wrap'>
                <SelectAppList
                    appList={this.props.appList}
                    getSelectAppList={this.getSelectAppList}
                />
                <div className='sure-cancel-btn'>
                    <span className='sure-btn' onClick={this.handleSureBtn}>{Intl.get('common.confirm', '确认')}</span>
                    <span className='cancel-btn' onClick={this.handleCancelBtn}>{Intl.get('common.cancel', '取消')}</span>
                </div>
            </div>
        );
    },
    renderAppIconName(appName, appId) {
        let appList = this.props.appList;
        let matchAppObj = _.find( appList, (appItem) => {
            return appItem.id === appId;
        });
        return (
            <span className="app-icon-name">
                {appName ? (
                    matchAppObj && matchAppObj.client_image ? (
                        <span className="app-self">
                            <img src={matchAppObj.client_image} />
                        </span>
                    ) : (
                        <span className='app-default'>
                            <i className='iconfont icon-app-default'></i>
                        </span>
                    )
                ) : null}
                <span className='app-name'>{appName}</span>
            </span>
        );
    },
    // 修改产品信息
    handleModifyUserCount(appId, event) {
        let userCount = event.target.value;
        _.find(this.state.products, (item) => {
            if (item.id === appId) {
                item.count = userCount;
            }
        });
        this.setState({
            products: this.state.products
        });
    },
    // 修改产品金额
    handleModifyPrice(appId, event) {
        let totalPrice = event.target.value;
        _.find(this.state.products, (item) => {
            if (item.id === appId) {
                item.total_price = totalPrice;
            }
        });
        this.setState({
            products: this.state.products
        });
    },
    // 删除产品信息
    handleDeleteProductsInfo(appId) {
        let restProducts = _.filter(this.state.products, item => item.id !== appId);
        this.setState({
            products: restProducts
        });
    },
    getProductColumns() {
        return [
            {
                title: Intl.get('common.app', '应用'),
                dataIndex: 'name',
                key: 'name',
                width: '40%',
                render: (text, record, index) => {
                    return <span className="app-info">{this.renderAppIconName(text, record.id)}</span>;
                }
            },
            {
                title: Intl.get('contract.171', '用户个数'),
                dataIndex: 'count',
                width: '20%',
                key: 'count',
                render: (text, record, index) => {
                    return <Input defaultValue={text} onChange={this.handleModifyUserCount.bind(this, record.id)}/>;
                }
            },
            {
                title: Intl.get('contract.172', '金额(元)'),
                dataIndex: 'total_price',
                key: 'total_price',
                width: '40%',
                render: (text, record, index) => {
                    return <span className='total-price'>
                        <Input
                            defaultValue={parseAmount(text)}
                            onChange={this.handleModifyPrice.bind(this, record.id)}
                        />
                        <i
                            title={Intl.get('common.delete', '删除')}
                            className="iconfont icon-close" onClick={this.handleDeleteProductsInfo.bind(this, record.id)}
                        >
                        </i>
                    </span>;
                }
            }
        ];
    },
    // 获取选中应用列表的数据
    getSelectAppListData() {
        let appList = this.props.appList;
        let selectAppList = this.state.selectAppList;
        let appArray = [];
        if (selectAppList.length) {
            _.forEach(selectAppList, (appId) => {
                _.forEach(appList, (appItem) => {
                    if (appItem.client_id === appId) {
                        appItem.count = 1;
                        appItem.total_price = 1000;
                        appItem.id = appItem.client_id;
                        appItem.name = appItem.client_name;
                        delete appItem.client_id;
                        delete appItem.client_name;
                        appArray.push(appItem);
                    }
                });
            });
        }
        return appArray;
    },
    renderProductInfo() {
        let columns = this.getProductColumns();
        return (
            <AntcTable
                dataSource={this.state.products}
                columns={columns}
                pagination={false}
                bordered
            />
        );

    },
    // 甲方
    handleCustomerName(event) {
        let formData = this.state.formData;
        formData.buyer = event.target.value;
        this.setState({formData});
    },
    // 合同类型
    handleSelectContractType(value) {
        this.setState({
            contractType: value
        });
    },
    // 签订时间
    handleSignContractDate(date) {
        let formData = this.state.formData;
        let timestamp = date && date.valueOf() || '';
        formData.date = timestamp;
        this.setState({formData});
    },
    // 有效期
    handleValidityTimeRange(dates) {
        let formData = this.state.formData;
        let startTime = dates && dates[0] && dates[0].valueOf() || '';
        let endTime = dates && dates[1] && dates[1].valueOf() || '';
        formData.start_time = startTime;
        formData.end_time = endTime;
        this.setState({formData});
    },
    // 合同额
    handleContractAmount(event) {
        let formData = this.state.formData;
        formData.contract_amount = removeCommaFromNum(event.target.value);
        this.setState({formData});
    },
    // 毛利
    handleContractGross(event) {
        let formData = this.state.formData;
        formData.gross_profit = removeCommaFromNum(event.target.value);
        this.setState({formData});
    },
    showAppListPanel() {
        this.setState({
            visible: true
        });
    },
    renderContractForm() {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 28 }
        };
        const formData = this.state.formData;
        return (
            <div className='add-contract-panel'>
                <div className='contract-title'>{Intl.get('contract.98', '添加合同')}</div>
                <div className='contract-form'>
                    <Form>
                        <FormItem {...formItemLayout} label={Intl.get('contract.4', '甲方')}>
                            <Input
                                value={formData.buyer}
                                onChange={this.handleCustomerName}
                            />
                        </FormItem>
                        <FormItem
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            label={Intl.get('contract.37', '合同类型')}
                        >
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={this.state.contractType}
                                onChange={this.handleSelectContractType}
                            >
                                <Option value="产品合同">{Intl.get('contract.6', '产品合同')}</Option>
                                <Option value="项目合同">{Intl.get('contract.7', '项目合同')}</Option>
                                <Option value="服务合同">{Intl.get('contract.8', '服务合同')}</Option>
                            </Select>
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.34', '签订时间')}>
                            <DatePicker
                                value={moment(formData.date)}
                                onChange={this.handleSignContractDate}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label='有效期'>
                            <RangePicker
                                className='validity-time'
                                ranges={{ '有效期一年': [moment(formData.start_time), moment(formData.end_time)] }}
                                placeholder={['开始时间', '结束时间']}
                                onChange={this.handleValidityTimeRange}
                                allowClear={false}
                            />

                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.25', '合同额')}>
                            <Input
                                value={parseAmount(formData.contract_amount)}
                                onChange={this.handleContractAmount}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.109', '毛利')}>
                            <Input
                                value={parseAmount(formData.gross_profit)}
                                onChange={this.handleContractGross}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.95', '产品信息')}>
                            {
                                this.state.isShowSelectAppTable ? this.renderProductInfo() : null
                            }
                            <div className='product-info' onClick={this.showAppListPanel}>
                                <Icon type='plus'/>
                                <span className='add-title'>{Intl.get('common.app', '应用')}</span>
                            </div>
                            {
                                this.state.visible ? this.renderAppSelectPanel() : null
                            }
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    },
    handleSubmit(event) {
        event.preventDefault();
        this.props.form.validateFields((err) => {
            if (err) {
                return;
            } else {
                // 添加时的数据
                let reqData = this.state.formData;
                reqData.category = this.state.contractType; // 合同类型
                reqData.user_id = UserData.getUserData().user_id || '';
                reqData.user_name = UserData.getUserData().user_name || '';
                let products = this.state.products; // 产品信息
                _.each(products, (item) => {
                    delete item.client_image;
                });
                reqData.products = products; // 产品信息
                reqData.customers = [{customer_name: reqData.customer_name, customer_id: this.props.customerId}]; // 客户信息
                this.setState({isLoading: true});
                ContractAjax.addContract({type: 'sell'}, reqData).then( (resData) => {
                    if (resData && resData.code === 0) {
                        this.state.errorMsg = '';
                        this.state.isLoading = false;
                        ContractAction.refreshContractList(resData.result);
                    } else {
                        this.state.errorMsg = Intl.get('crm.154', '添加失败');
                    }
                    this.setState(this.state);
                }, (errMsg) => {
                    this.setState({
                        isLoading: false,
                        errMsg: errMsg || Intl.get('crm.154', '添加失败')
                    });
                });
            }
        });
    },
    handleCancel() {
        ContractAction.hideForm();
    },
    render(){
        console.log('rendr',this.state.products);
        return (
            <DetailCard
                content={this.renderContractForm()}
                isEdit={true}
                className='contract-form-container'
                loading={this.state.isLoading}
                saveErrorMsg={this.state.errMsg}
                handleSubmit={this.handleSubmit}
                handleCancel={this.handleCancel}
            />);
    }
});

const ContractForm = Form.create()(Contract);

module.exports = ContractForm;