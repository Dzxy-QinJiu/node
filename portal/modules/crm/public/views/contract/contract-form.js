import { Form, Input, Select, Icon, DatePicker} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
import DetailCard from 'CMP_DIR/detail-card';
import ProductTable from 'CMP_DIR/basic-edit-field-new/product-table';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
const removeCommaFromNum = antUtilsNum.removeCommaFromNum;
import ContractAction from '../../action/contract-action';
const UserData = require('PUB_DIR/sources/user-data');
const ContractAjax = require('../../ajax/contract-ajax');
const ValidateRule = require('PUB_DIR/sources/utils/validate-rule');
import Trace from 'LIB_DIR/trace';
const { CategoryList, ContractLabel} = require('PUB_DIR/sources/utils/consts');

// 开通应用，默认的数量和金额
const APP_DEFAULT_INFO = {
    COUNT: 1,
    PRICE: 1000
};

const Contract = React.createClass( {
    getInitialState() {
        return {
            isLoading: false,
            errMsg: '',
            isShowSelectAppTable: false, // 是否显示应用表格
            appList: this.props.appList, // 应用列表
            selectedAppIdArray: [], // 选择的应用id
            lastSelectedAppIdArray: [], // 上一次选择的应用id
            contractType: '产品合同', // 合同类型
            contractLabel: 'new', // 合同签约类型
            formData: {
                customer_name: this.props.curCustomer.name,
                buyer: this.props.curCustomer.name,
                stage: '待审',
                date: moment().valueOf(),
                start_time: moment().valueOf(),
                end_time: moment().add(1, 'year').valueOf(),
                contract_amount: 0,
                gross_profit: 0,
            }, // 合同信息
            products: [] // 产品数据
        };
    },
    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'customerId') && nextProps.customerId !== this.props.customerId) {
            let formData = this.state.formData;
            formData.customer_name = nextProps.curCustomer.name;
            formData.buyer = nextProps.curCustomer.name;
            this.setState({formData});
        }
    },
    // 获取选中的应用列表
    getSelectAppList(selectedAppIdArray) {
        this.setState({
            selectedAppIdArray: selectedAppIdArray
        });
    },

    // 修改产品信息
    modifyProductsInfo(appId, modifyValue, filed) {
        let modifyAppObj = _.find(this.state.products, item => item.client_id === appId);
        if (modifyAppObj) {
            modifyAppObj[filed] = modifyValue;
        }
    },
    // 修改产品数量
    handleModifyUserCount(appId, event) {
        let userCount = event.target.value;
        this.modifyProductsInfo(appId, userCount, 'count');
    },
    // 修改产品金额
    handleModifyPrice(appId, event) {
        let totalPrice = event.target.value;
        this.modifyProductsInfo(appId, totalPrice, 'total_price');
    },
    // 删除产品信息
    handleDeleteProductsInfo(appId) {
        Trace.traceEvent($(this.getDOMNode()).find('.total-price'),'点击删除产品信息');
        let restProducts = _.filter(this.state.products, item => item.client_id !== appId);
        let restSelectAppIdArray = _.filter(this.state.selectedAppIdArray, id => id !== appId);
        this.setState({
            products: restProducts,
            selectedAppIdArray: restSelectAppIdArray,
            lastSelectedAppIdArray: restSelectAppIdArray
        });
    },
    // 获取选中应用列表的数据
    getSelectAppListData() {
        let appList = this.props.appList;
        let selectedAppIdArray = this.state.selectedAppIdArray;
        let allSelectAppIdArray = selectedAppIdArray.concat(this.state.lastSelectedAppIdArray);
        let selectAppList = [];
        if (allSelectAppIdArray.length) {
            selectAppList = _.filter(appList, appItem => allSelectAppIdArray.indexOf(appItem.client_id) !== -1);
            _.each(selectAppList, (appItem) => {
                if (!appItem.count) {
                    appItem.count = APP_DEFAULT_INFO.COUNT;
                }
                if (!appItem.total_price) {
                    appItem.total_price = APP_DEFAULT_INFO.PRICE;
                }
            });
        }
        return selectAppList;
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
    // 合同签约类型
    handleSelectContractLabel(value) {
        this.setState({
            contractLabel: value
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
        let startTime = _.get(dates, '[0]') && _.get(dates, '[0]').valueOf() || '';
        let endTime = _.get(dates, '[1]') && _.get(dates, '[1]').valueOf() || '';
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
    // 未选择的应用列表
    getUnselectAppList() {
        let appList = this.state.appList;
        let selectedAppIdArray = this.state.selectedAppIdArray;
        let unSelectedAppList = appList;
        if (selectedAppIdArray.length) {
            unSelectedAppList = _.filter(appList, appItem => selectedAppIdArray.indexOf(appItem.client_id) === -1);
        }
        return unSelectedAppList;

    },
    // 鼠标聚焦到input输入框时
    handleInputFocus() {
        this.setState({
            errMsg: ''
        });
    },
    renderContractForm() {
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 }
        };
        const formData = this.state.formData;
        const { getFieldDecorator } = this.props.form;
        let categoryOptions = _.map(CategoryList, (category, index) => {
            return (<Option value={category.value} key={index}>{category.name}</Option>);
        });
        let labelOptions = _.map(ContractLabel, (label) => {
            return <Option key={label.value} value={label.value}>{label.name}</Option>;
        });
        let validityTime = Intl.get('crm.contract.validity.one.year', '有效期一年');
        return (
            <div className='add-contract-panel' data-tracename="添加合同面板">
                <div className='contract-title'>{Intl.get('contract.98', '添加合同')}</div>
                <div className='contract-form'>
                    <Form>
                        <FormItem {...formItemLayout} label={Intl.get('contract.4', '甲方')}>
                            <Input
                                value={formData.buyer}
                                onChange={this.handleCustomerName}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.37', '合同类型')}>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={this.state.contractType}
                                onChange={this.handleSelectContractType}
                            >
                                { categoryOptions }
                            </Select>
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.164', '签约类型')}>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={this.state.contractLabel}
                                notFoundContent={Intl.get('contract.71', '暂无签约类型')}
                                onChange={this.handleSelectContractLabel}
                            >
                                { labelOptions }
                            </Select>
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.34', '签订时间')}>
                            <DatePicker
                                value={moment(formData.date)}
                                onChange={this.handleSignContractDate}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('crm.contract.validity.time', '有效期')}>
                            <RangePicker
                                className='validity-time'
                                ranges={{ [validityTime]: [moment(formData.start_time), moment(formData.end_time)] }}
                                placeholder={[Intl.get('contract.120', '开始时间'), Intl.get('contract.105', '结束时间')]}
                                onChange={this.handleValidityTimeRange}
                                allowClear={false}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.25', '合同额')}>
                            {getFieldDecorator('contract_amount', {
                                rules: [ValidateRule.getNumberValidateRule()]
                            })( <Input
                                value={parseAmount(formData.contract_amount)}
                                onChange={this.handleContractAmount}
                                onFocus={this.handleInputFocus}
                                addonAfter={Intl.get('contract.82', '元')}
                            />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.109', '毛利')}>
                            {getFieldDecorator('gross_profit', {
                                rules: [ValidateRule.getNumberValidateRule()]
                            })(<Input
                                value={parseAmount(formData.gross_profit)}
                                onChange={this.handleContractGross}
                                addonAfter={Intl.get('contract.82', '元')}
                            />)}

                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.95', '产品信息')}>
                            <ProductTable
                                appList={this.props.appList}
                                isEdit={true}
                            />
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    },
    // 添加合同的ajax
    addContractAjax(reqData) {
        this.setState({isLoading: true});
        ContractAjax.addContract({type: 'sell'}, reqData).then( (resData) => {
            if (resData && resData.code === 0) {
                this.state.errMsg = '';
                this.state.isLoading = false;
                ContractAction.refreshContractList(resData.result);
            } else {
                this.state.errMsg = Intl.get('crm.154', '添加失败');
            }
            this.setState(this.state);
        }, (errMsg) => {
            this.setState({
                isLoading: false,
                errMsg: errMsg || Intl.get('crm.154', '添加失败')
            });
        });
    },
    handleSubmit(event) {
        event.preventDefault();
        Trace.traceEvent(event, '点击保存按钮');
        this.props.form.validateFields((err) => {
            if (err) {
                return;
            } else {
                // 添加时的数据
                let reqData = this.state.formData;
                reqData.category = this.state.contractType; // 合同类型
                reqData.label = this.state.contractLabel; // 合同签约类型
                reqData.user_id = UserData.getUserData().user_id || '';
                reqData.user_name = UserData.getUserData().user_name || '';
                let products = _.cloneDeep(this.state.products); // 产品信息
                let productTotalPrice = 0; // 产品信息中的总额；
                let processProducts = _.map(products, (item) => {
                    // item.total_price是字符串格式，+是为了将字符串转为数字格式
                    productTotalPrice += +item.total_price;
                    return {id: item.client_id, name: item.client_name, count: item.count, total_price: item.total_price};
                });
                // 判断产品信息中的总额和合同额是否相同，若相同，则发请求，否则，给出信息提示
                // reqData.contract_amount是字符串格式，+是为了将字符串转为数字格式
                if (productTotalPrice !== +reqData.contract_amount) {
                    this.setState({
                        errMsg: Intl.get('crm.contract.check.tips', '合同额与产品总额不相等，请核对')
                    });
                    return;
                }
                reqData.products = processProducts; // 产品信息
                reqData.customers = [{customer_name: reqData.customer_name, customer_id: this.props.customerId}]; // 客户信息
                this.addContractAjax(reqData);
            }
        });
    },
    handleCancel(event) {
        Trace.traceEvent(event, '点击取消按钮');
        ContractAction.hideForm();
    },
    render(){
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