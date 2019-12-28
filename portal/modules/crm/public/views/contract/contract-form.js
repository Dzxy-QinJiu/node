var React = require('react');
import { Form, Input, Select, Icon, DatePicker } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import DetailCard from 'CMP_DIR/detail-card';
import { AntcValidity } from 'antc';
import ProductTable from 'CMP_DIR/basic-edit-field-new/product-table';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
const removeCommaFromNum = antUtilsNum.removeCommaFromNum;
import ContractAction from '../../action/contract-action';
const UserData = require('PUB_DIR/sources/user-data');
const ContractAjax = require('../../ajax/contract-ajax');
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
import Trace from 'LIB_DIR/trace';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
const { CategoryList, ContractLabel } = require('PUB_DIR/sources/utils/consts');

class Contract extends React.Component {
    state = {
        isLoading: false,
        errMsg: '',
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
            remarks: '',
        }, // 合同信息
        products: [] // 产品数据
    };

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'customerId') && nextProps.customerId !== this.props.customerId) {
            let formData = this.state.formData;
            formData.customer_name = nextProps.curCustomer.name;
            formData.buyer = nextProps.curCustomer.name;
            this.setState({ formData });
        }
    }

    // 修改产品信息
    modifyProductsInfo = (appId, modifyValue, filed) => {
        let modifyAppObj = _.find(this.state.products, item => item.client_id === appId);
        if (modifyAppObj) {
            modifyAppObj[filed] = modifyValue;
        }
    };

    // 修改产品数量
    handleModifyUserCount = (appId, event) => {
        let userCount = event.target.value;
        this.modifyProductsInfo(appId, userCount, 'count');
    };

    // 修改产品金额
    handleModifyPrice = (appId, event) => {
        let totalPrice = event.target.value;
        this.modifyProductsInfo(appId, totalPrice, 'total_price');
    };

    // 删除产品信息
    handleDeleteProductsInfo = (appId) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.total-price'), '点击删除产品信息');
        let restProducts = _.filter(this.state.products, item => item.client_id !== appId);
        let restSelectAppIdArray = _.filter(this.state.selectedAppIdArray, id => id !== appId);
        this.setState({
            products: restProducts,
            selectedAppIdArray: restSelectAppIdArray,
            lastSelectedAppIdArray: restSelectAppIdArray
        });
    };

    // 甲方
    handleCustomerName = (event) => {
        let formData = this.state.formData;
        formData.buyer = event.target.value;
        this.setState({ formData });
    };

    // 合同类型
    handleSelectContractType = (value) => {
        this.setState({
            contractType: value
        });
    };

    // 合同签约类型
    handleSelectContractLabel = (value) => {
        this.setState({
            contractLabel: value
        });
    };

    // 签订时间
    handleSignContractDate = (date) => {
        let formData = this.state.formData;
        let timestamp = date && date.valueOf() || '';
        formData.date = timestamp;
        this.setState({ formData });
    };

    // 有效期
    handleValidityTimeRange = (startTime, endTime) => {
        let formData = this.state.formData;
        formData.start_time = startTime;
        formData.end_time = endTime;
        this.setState({ formData });
    };

    // 合同额
    handleContractAmount = (event) => {
        let formData = this.state.formData;
        formData.contract_amount = removeCommaFromNum(event.target.value);
        this.setState({ formData });
    };

    // 毛利
    handleContractGross = (event) => {
        let formData = this.state.formData;
        formData.gross_profit = removeCommaFromNum(event.target.value);
        this.setState({ formData });
    };

    // 鼠标聚焦到input输入框时
    handleInputFocus = () => {
        this.setState({
            errMsg: ''
        });
    };

    renderContractForm = () => {
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
                                filterOption={(input, option) => ignoreCase(input, option)}
                            >
                                {categoryOptions}
                            </Select>
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.164', '签约类型')}>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                value={this.state.contractLabel}
                                notFoundContent={Intl.get('contract.71', '暂无签约类型')}
                                onChange={this.handleSelectContractLabel}
                                filterOption={(input, option) => ignoreCase(input, option)}
                            >
                                {labelOptions}
                            </Select>
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.34', '签订时间')}>
                            <DatePicker
                                value={formData.date ? moment(formData.date) : ''}
                                onChange={this.handleSignContractDate}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('crm.contract.validity.time', '有效期')}>
                            <AntcValidity
                                className='validity-time'
                                mode="add"
                                onChange={this.handleValidityTimeRange}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.25', '合同额')}>
                            {getFieldDecorator('contract_amount', {
                                rules: [
                                    {required: true, message: Intl.get('crm.contract.enter.contract.money', '请输入合同额')},
                                    getNumberValidateRule()
                                ],
                                getValueFromEvent: (event) => {
                                    // 先remove是处理已经带着逗号的数字，parse后会有多个逗号的问题
                                    return parseAmount(removeCommaFromNum(event.target.value));
                                }
                            })(<Input
                                value={parseAmount(formData.contract_amount)}
                                onChange={this.handleContractAmount}
                                onFocus={this.handleInputFocus}
                                addonAfter={Intl.get('contract.82', '元')}
                            />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('contract.109', '毛利')}>
                            {getFieldDecorator('gross_profit', {
                                rules: [getNumberValidateRule()],
                                getValueFromEvent: (event) => {
                                    // 先remove是处理已经带着逗号的数字，parse后会有多个逗号的问题
                                    return parseAmount(removeCommaFromNum(event.target.value));
                                }
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
                                addBtnText={Intl.get('common.product', '产品')}
                                isSaveCancelBtnShow={false}
                                onChange={this.handleProductChange}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout} label={Intl.get('common.remark', '备注')}>
                            {
                                getFieldDecorator('remarks', {
                                    initialValue: _.get(formData, 'remarks', '')
                                })(
                                    <Input.TextArea
                                        className="ant-textarea"
                                        autosize={{minRows: 2, maxRows: 6}}
                                        placeholder={Intl.get('user.input.remark', '请输入备注')}

                                    />
                                )
                            }
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    };

    // 添加合同的ajax
    addContractAjax = (reqData) => {
        this.setState({ isLoading: true });
        ContractAjax.addContract({ type: 'sell' }, reqData).then((resData) => {
            if (resData && resData.code === 0) {
                this.setState({
                    errMsg: '',
                    isLoading: false
                });
                ContractAction.refreshContractList(resData.result);
            } else {
                this.setState({
                    errMsg: Intl.get('crm.154', '添加失败'),
                });
            }
        }, (errMsg) => {
            this.setState({
                isLoading: false,
                errMsg: errMsg || Intl.get('crm.154', '添加失败')
            });
        });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        Trace.traceEvent(event, '点击保存按钮');
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            } else {
                // 添加时的数据
                let reqData = _.cloneDeep(this.state.formData);
                reqData.remarks = _.get(values, 'remarks', '');//备注
                reqData.category = this.state.contractType; // 合同类型
                reqData.label = this.state.contractLabel; // 合同签约类型
                reqData.user_id = UserData.getUserData().user_id || '';
                reqData.user_name = UserData.getUserData().nick_name || '';
                let products = _.cloneDeep(this.state.products); // 产品信息
                let productTotalPrice = 0; // 产品信息中的总额；
                _.each(products, (item) => {
                    // item.total_price是字符串格式，+是为了将字符串转为数字格式
                    productTotalPrice += +item.total_price;
                });
                // 判断合同额是否大于等于产品信息中的总额，若大于等于，则发请求，否则，给出信息提示
                // reqData.contract_amount是字符串格式，+是为了将字符串转为数字格式
                reqData.contract_amount = +reqData.contract_amount;
                if (reqData.contract_amount < productTotalPrice) {
                    this.setState({
                        errMsg: Intl.get('contract.amount.check.tip', '产品总额不能大于合同总额{amount}元，请核对',{amount: reqData.contract_amount})
                    });
                    return;
                }
                if(reqData.contract_amount < reqData.gross_profit) {
                    this.setState({
                        errMsg: Intl.get('contract.profit.check.tip', '毛利不能大于合同总额{amount}元，请核对',{amount: reqData.contract_amount}),
                    });
                    return;
                }
                
                reqData.products = products; // 产品信息
                reqData.customers = [{customer_name: reqData.customer_name, customer_id: this.props.customerId}]; // 客户信息
                this.addContractAjax(reqData);
            }
        });
    };

    handleCancel = (event) => {
        Trace.traceEvent(event, '点击取消按钮');
        ContractAction.hideForm();
    };

    handleProductChange = (data) => {
        this.setState({products: data});
    };

    render() {
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
}

Contract.propTypes = {
    curCustomer: PropTypes.object,
    customerId: PropTypes.string,
    form: PropTypes.object,
    appList: PropTypes.array,
};
module.exports = Form.create()(Contract);
