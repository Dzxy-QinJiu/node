/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form, DatePicker, Input } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import InvoiceAmount from './invoice-amount';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { DISPLAY_TYPES, OPERATE, PRIVILEGE_MAP} from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import { checkPhone } from 'PUB_DIR/sources/utils/validate-util';

class DetailInvoice extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_INVOICE);

        return {
            loading: false,
            submitErrorMsg: '',
            hasEditPrivilege, // 添加和修改发票信息的权限
            displayType: DISPLAY_TYPES.TEXT,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            this.setState({
                displayType: DISPLAY_TYPES.TEXT
            });
        }
    }

    updateScrollBar = () => {
        const scrollBar = this.refs.gemiScrollBar;

        if (!scrollBar) {
            return;
        }

        scrollBar.update();
    };

    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加发票信息表单');
            this.setState({
                displayType: type,
                submitErrorMsg: '',
            }, () => {
                this.updateScrollBar();
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            this.setState({
                displayType: type
            }, () => {
                this.updateScrollBar();
            });
        }
    }
    handleSubmit(type) {
        let _this = this;
        let saveObj;
        if(type === 'add') {
            this.props.form.validateFields((err,value) => {
                if (err) return false;

                this.setState({loading: true});
                saveObj = {...value};
                if(_.isNil(saveObj.contract_id)){
                    saveObj.contract_id = this.props.contract.id;
                }

                const successFunc = (resultData) => {
                    _this.setState({
                        loading: false,
                        submitErrorMsg: '',
                        displayType: DISPLAY_TYPES.TEXT
                    }, () => {
                        this.updateScrollBar();
                    });
                };
                const errorFunc = (errorMsg) => {
                    _this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg
                    });
                };
                this.editInvoice(type, saveObj, successFunc, errorFunc);
            });
        }
    }
    editInvoice(type, data, successFunc, errorFunc) {

        const handler = type + 'Invoice';
        const route = _.find(routeList, route => route.handler === handler);
        let arg = {
            url: route.path,
            type: route.method,
            data: data,
        };

        let targetName, changePropName, isInvoiceBasicInforOrInvoices = type;
        targetName = Intl.get('contract.40', '发票基本信息');
        changePropName = 'invoice_detail';
        isInvoiceBasicInforOrInvoices = 'addOrUpdateInvoiceBasic';
        Trace.traceEvent(ReactDOM.findDOMNode(this), OPERATE[type] + targetName);

        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(OPERATE[type] + targetName + '成功');
                this.props.refreshCurrentContractNoAjax(changePropName, isInvoiceBasicInforOrInvoices, result.result, '');

                if (_.isFunction(successFunc)) successFunc(result.result);
            } else {
                if (_.isFunction(errorFunc)) errorFunc(OPERATE[type] + targetName + Intl.get('user.failed', '失败'));
            }
        }, errorMsg => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE[type] + targetName + Intl.get('user.failed', '失败'));
        });
    }
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };
    updateInoviceInfo = (saveObj, successFunc, errorFunc) => {
        let invoice_detail = _.cloneDeep(this.props.contract.invoice_detail);
        invoice_detail = { ...invoice_detail,...saveObj };
        this.editInvoice('update',invoice_detail, successFunc, errorFunc);
    };

    renderAddInvoicePanel = () => {
        let {getFieldDecorator} = this.props.form;

        return (
            <Form className='detailcard-form-container'>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('contract.47', '公司全称')}
                >
                    {
                        getFieldDecorator('payer_name',{
                            rules: [{required: true, message: Intl.get('contract.48', '请填写公司全称')}]
                        })(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('contract.49', '银行帐号')}
                >
                    {
                        getFieldDecorator('account_number')(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('contract.50', '开户行')}
                >
                    {
                        getFieldDecorator('opening_bank')(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.address', '地址')}
                >
                    {
                        getFieldDecorator('address')(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.phone', '电话')}
                >
                    {
                        getFieldDecorator('phone',{
                            rules: [{
                                validator: checkPhone
                            }]
                        })(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('contract.51', '邮寄地址')}
                >
                    {
                        getFieldDecorator('email_address')(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('contract.52', '营业执照号码')}
                >
                    {
                        getFieldDecorator('business_license_id')(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('contract.53', '组织机构代码')}
                >
                    {
                        getFieldDecorator('organization_id')(
                            <Input/>
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('contract.54', '纳税人识别号')}
                >
                    {
                        getFieldDecorator('taxpayer_id')(
                            <Input/>
                        )
                    }
                </FormItem>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    okBtnText={Intl.get('common.add', '添加')}
                    handleSubmit={this.handleSubmit.bind(this,'add')}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    };

    renderInvoiceInfo = () => {
        let hasEditPrivilege = this.state.hasEditPrivilege;
        const contract = this.props.contract;
        let {invoice_detail} = contract;

        const content = () => (
            <div className='invoice-info-container'>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.47', '公司全称')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="payer_name"
                        value={invoice_detail.payer_name}
                        placeholder={Intl.get('contract.48', '请填写公司全称')}
                        validators={[{required: true, message: Intl.get('contract.48', '请填写公司全称')}]}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('contract.47', '公司全称')}`}
                        editBtnTip={`${Intl.get('common.update', '修改')}${Intl.get('contract.47', '公司全称')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.49', '银行帐号')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="account_number"
                        value={invoice_detail.account_number}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={`${Intl.get('contract.input', '请输入')}${Intl.get('contract.49', '银行帐号')}`}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('contract.49', '银行帐号')}`}
                        editBtnTip={`${Intl.get('common.update', '修改')}${Intl.get('contract.49', '银行帐号')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.50', '开户行')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="opening_bank"
                        value={invoice_detail.opening_bank}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={`${Intl.get('contract.input', '请输入')}${Intl.get('contract.50', '开户行')}`}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('contract.50', '开户行')}`}
                        editBtnTip={`${Intl.get('common.update', '修改')}${Intl.get('contract.50', '开户行')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('common.address', '地址')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="address"
                        value={invoice_detail.address}
                        placeholder={`${Intl.get('contract.input', '请输入')}${Intl.get('common.address', '地址')}`}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('common.address', '地址')}`}
                        editBtnTip={`${Intl.get('common.update', '修改')}${Intl.get('contract.50', '开户行')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('common.phone', '电话')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="phone"
                        value={invoice_detail.phone}
                        validators={[{
                            validator: checkPhone
                        }]}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={`${Intl.get('contract.input', '请输入')}${Intl.get('common.phone', '电话')}`}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('common.phone', '电话')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.51', '邮寄地址')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="email_address"
                        value={invoice_detail.email_address}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={`${Intl.get('contract.input', '请输入')}${Intl.get('contract.51', '邮寄地址')}`}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('contract.51', '邮寄地址')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.52', '营业执照号码')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="business_license_id"
                        value={invoice_detail.business_license_id}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={`${Intl.get('contract.input', '请输入')}${Intl.get('contract.52', '营业执照号码')}`}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('contract.52', '营业执照号码')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.53', '组织机构代码')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="organization_id"
                        value={invoice_detail.organization_id}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={`${Intl.get('contract.input', '请输入')}${Intl.get('contract.53', '组织机构代码')}`}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('contract.53', '组织机构代码')}`}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.54', '纳税人识别号')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={invoice_detail.id}
                        field="taxpayer_id"
                        value={invoice_detail.taxpayer_id}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={`${Intl.get('contract.input', '请输入')}${Intl.get('contract.54', '纳税人识别号')}`}
                        saveEditInput={this.updateInoviceInfo}
                        addDataTip={`${Intl.get('menu.shortName.config', '设置')}${Intl.get('contract.54', '纳税人识别号')}`}
                    />
                </div>
            </div>
        );

        return (
            <DetailCard
                content={content()}
                className="member-detail-container"
            />
        );
    };

    // 渲染发票信息
    renderInvoice() {
        const invoiceDetail = this.props.contract.invoice_detail || {};

        //编辑按钮是否显示, 发票信息为空+展示信息时+编辑权限
        const isEditBtnShow = _.isEmpty(invoiceDetail.id) && this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege;

        const detailOp = invoiceDetail.id ? 'update' : 'add';
        const noInoviceDetail = _.isEmpty(invoiceDetail.id);

        const content = () => {
            return (
                <div className="repayment-list">
                    {this.state.displayType === DISPLAY_TYPES.EDIT ? this.renderAddInvoicePanel() : isEditBtnShow ? (
                        <span className="iconfont icon-add" onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}
                            title={Intl.get('common.edit', '编辑')}/>) : null}
                    {!noInoviceDetail ? this.renderInvoiceInfo() : null}
                </div>
            );
        };
        let invoiceTitle = (
            <div className="repayment-repay">
                {!noInoviceDetail ? <span>{Intl.get('contract.40', '发票基本信息')}: </span> : null}
            </div>
        );
        return (
            <DetailCard
                content={content()}
                titleBottomBorderNone={noInoviceDetail}
                titleDescr={noInoviceDetail ? (this.state.displayType === DISPLAY_TYPES.TEXT ? Intl.get('contract.55', '发票基本信息尚未添加') : `${Intl.get('common.add', '添加')}${Intl.get('contract.40', '发票基本信息')}`) : ''}
                title={invoiceTitle}
            />
        );
    }

    // 渲染发票额信息
    renderInvoiceAmount() {
        return (
            <InvoiceAmount
                contract={this.props.contract}
                updateScrollBar={this.updateScrollBar}
                refreshCurrentContractNoAjax={this.props.refreshCurrentContractNoAjax}
            />
        );
    }

    render() {
        const DetailBlock = (
            <div className='clearfix contract-repayment-container'>
                {this.renderInvoice()}
                {this.renderInvoiceAmount()}
            </div>
        );

        return (
            <div style={{height: this.props.height}} data-tracename="发票信息页面">
                <GeminiScrollBar ref='geminiScrollBar'>
                    {DetailBlock}
                </GeminiScrollBar>
            </div>
        );
    }
}

DetailInvoice.propTypes = {
    height: PropTypes.string,
    contract: PropTypes.object,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractNoAjax: PropTypes.func,
    viewType: PropTypes.string,
    form: PropTypes.object
};
module.exports = Form.create()(DetailInvoice);

