const Validation = require('rc-form-validation');
import ValidateMixin from '../../../../../mixins/ValidateMixin';
import { Form, Input, InputNumber, Icon, DatePicker,Popover, Button} from 'antd';
const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
import DetailCard from 'CMP_DIR/detail-card';
import SelectAppList from '../../../../../components/select-app-list';
import { AntcTable } from 'antc';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;

const ContractForm = React.createClass( {
    mixins: [ValidateMixin],
    getInitialState() {
        return {
            isLoading: false,
            errorMsg: '',
            visible: false, // 是否显示应用选择项
            isShowSelectAppTable: false, // 是否显示应用表格
            formData: JSON.parse(JSON.stringify(this.props.contract)),
        };
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.currentId !== this.props.currentId) {
            this.state.formData.customerName = nextProps.curCustomer.name;
            this.setState({});
        }
    },
    handleTimeChange(dates, dateStrings) {
        console.log('From: ', dates[0], ', to: ', dates[1]);
        console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
    },
    handleOk(value) {

    },
    handleSureBtn() {
        this.setState({
            isShowSelectAppTable: true,
            visible: false
        });
    },
    handleCancelBtn(){
        this.setState({
            visible: false
        });
    },
    handleVisibleChange(visible){
        this.setState({ visible });
    },
    popContent() {
        const formData = this.state.formData;
        //添加时，app的添加，修改时不需要展示
        let selectedAppList = [];
        let selectedAppListId = [];
        const appList = this.props.appList;
        let apps = [];
        if (!formData.id) {
            if (formData.apps && formData.apps.length > 0) {
                selectedAppList = this.props.appList.filter(app => {
                    if (formData.apps.indexOf(app.app_id) > -1) {
                        return true;
                    }
                });
                selectedAppListId = _.map(selectedAppList, 'app_id');
            }
            if (appList && appList.length > 0 && formData.apps && formData.apps.length > 0) {
                apps = _.filter(appList, app => {
                    if (formData.apps.indexOf(app.app_id) > -1) return true;
                });
            }
        }
        return (
            <div className='app-select-list-popover-confirm'>
                <SelectAppList
                    appList={this.props.appList}
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
            return appItem.client_id === appId;
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
                render: (text) => {
                    return <Input defaultValue={text}/>;
                }
            },
            {
                title: Intl.get('contract.172', '金额(元)'),
                dataIndex: 'total_price',
                key: 'total_price',
                width: '40%',
                render: (text) => {
                    return <span className='total-price'>
                        <Input defaultValue={parseAmount(text.toFixed(2))} />
                        <i title={Intl.get('common.delete', '删除')} className="iconfont icon-close"></i>
                    </span>;
                }
            }
        ];
    },
    renderProductInfo() {
        let columns = this.getProductColumns();
        let products = [
            { count: 1, id: '', name: '鹰眼速读网系统', total_price: 1000},
            { count: 1, id: '', name: '鹰击早发现系统', total_price: 1000}
        ];
        return (
            <AntcTable
                dataSource={products}
                columns={columns}
                pagination={false}
                bordered
            />
        );
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
                        <Validation ref='validation' onValidate={this.handleValidate}>
                            <FormItem {...formItemLayout} label={Intl.get('contract.4', '甲方')}>
                                <Input
                                    name='customer_name'
                                    id='customer_name'
                                    value={formData.customer_name || this.props.curCustomer.name}
                                    onChange={this.setField.bind(this, 'customer_name')}
                                />
                            </FormItem>
                            <FormItem {...formItemLayout} label={Intl.get('contract.34', '签订时间')}>
                                <DatePicker
                                    name='date'
                                    id='date'
                                    value={moment(formData.date) || moment().valueOf()}
                                    onChange={this.setField.bind(this, 'date')}
                                />
                            </FormItem>
                            {/***
                             <FormItem {...formItemLayout} label='有效期'>
                             <RangePicker
                             className='validity-time'
                             ranges={{ '有效期一年': [moment(), moment().add(1, 'year')] }}
                             onChange={this.handleTimeChange}
                             onOk={this.handleOk}
                             showTime
                             />

                             </FormItem>
                             */}
                            <FormItem {...formItemLayout} label={Intl.get('contract.25', '合同额')}>
                                <Input
                                    name='contract_amount'
                                    id='contract_amount'
                                    value={this.parseAmount(formData.contract_amount)}
                                    onChange={this.setField.bind(this, 'contract_amount')}
                                />
                            </FormItem>
                            <FormItem {...formItemLayout} label={Intl.get('contract.109', '毛利')}>
                                <Input
                                    name='gross_profit'
                                    id='gross_profit'
                                    value={this.parseAmount(formData.gross_profit)}
                                    onChange={this.setField.bind(this, 'gross_profit')}
                                />
                            </FormItem>
                            <FormItem {...formItemLayout} label={Intl.get('contract.95', '产品信息')}>
                                <Popover content={this.popContent()}
                                    trigger='click'
                                    visible={this.state.visible}
                                    onVisibleChange={this.handleVisibleChange}
                                    placement='bottomLeft'
                                >
                                    {
                                        this.state.isShowSelectAppTable ? this.renderProductInfo() : null
                                    }
                                    <div className='product-info'>
                                        <Icon type='plus'/>
                                        <span className='add-title'>{Intl.get('common.app', '应用')}</span>
                                    </div>
                                </Popover>
                            </FormItem>
                        </Validation>
                    </Form>
                </div>
            </div>
        );
    },
    render(){
        return (
            <DetailCard
                content={this.renderContractForm()}
                isEdit={true}
                className='contract-form-container'
                loading={this.state.isLoading}
                saveErrorMsg={this.state.errorMsg}
                handleSubmit={this.handleSubmit}
                handleCancel={this.handleCancel}
            />);
    }
});

module.exports = ContractForm;