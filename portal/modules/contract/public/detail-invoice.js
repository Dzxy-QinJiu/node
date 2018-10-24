var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 发票信息添加、展示及编辑页面
 */

import routeList from '../common/route';
import ajax from '../common/ajax';
import {Form, Input, Icon, DatePicker, Button, message} from 'antd';
const FormItem = Form.Item;
import ValidateMixin from '../../../mixins/ValidateMixin';
import rightPanelUtil from '../../../components/rightPanel';
const RightPanelEdit = rightPanelUtil.RightPanelEdit;
const RightPanelDelete = rightPanelUtil.RightPanelDelete;
const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
const RightPanelCancel = rightPanelUtil.RightPanelCancel;
const hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
import {DATE_FORMAT, OPERATE} from '../consts';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
const DetailInvoice = createReactClass({
    displayName: 'DetailInvoice',
    mixins: [ValidateMixin],

    getInitialState: function() {
        return {
            formData: {},
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.clearState();
    },

    showForm: function(index, invoice) {
        if (isNaN(index)) {
            index = '';

            let invoiceDetail = this.props.contract.invoice_detail;

            if (_.isEmpty(invoiceDetail)) {
                invoiceDetail = {contract_id: this.props.contract.id};
            } else {
                invoiceDetail = JSON.parse(JSON.stringify(invoiceDetail));
            }

            this.state.formData = invoiceDetail;
        } else {
            const key = 'formData' + index;
            this.state[key] = _.clone(invoice);
        }

        this.state['isFormShow' + index] = true;
        this.setState(this.state);
    },

    hideForm: function(index) {
        if (isNaN(index)) index = '';
        this.state['isFormShow' + index] = false;
        this.setState(this.state);
    },

    handleSubmit: function(type, index, target, id) {
        let data, params, cb;

        if (type === 'delete') {
            params = {id: id};
            this.editInvoice(type, data, params, cb, target, id);
        } else if (type === 'add' || type === 'update') {
            if (isNaN(index)) index = '';
            data = this.state['formData' + index];

            cb = () => {
                if (type === 'update') {
                    this.hideForm(index);
                }
            };

            this.refs['validation' + index].validate(valid => {
                if (!valid) {
                    return;
                } else {
                    this.editInvoice(type, data, params, cb, target, id);
                }
            });
        }
    },

    editInvoice: function(type, data, params, cb, target, id) {
        this.props.showLoading();

        if (!target || _.isObject(target)) target = '';

        const handler = type + 'Invoice' + target;
        const route = _.find(routeList, route => route.handler === handler);
        const arg = {
            url: route.path,
            type: route.method,
            data: data || {},
        };
        if (params) arg.params = params;

        ajax(arg).then(result => {
            this.props.hideLoading();

            if (result.code === 0) {
                let targetName, changePropName, isInvoiceBasicInforOrInvoices = type;
                if (target) {
                    targetName = Intl.get('contract.39', '发票额记录');
                    changePropName = 'invoices';
                } else {
                    targetName = Intl.get('contract.40', '发票基本信息');
                    changePropName = 'invoice_detail';
                    isInvoiceBasicInforOrInvoices = 'addOrUpdateInvoiceBasic';
                }
                message.success(OPERATE[type] + targetName + '成功');
                this.props.refreshCurrentContractNoAjax(changePropName, isInvoiceBasicInforOrInvoices, result.result, id);
                if (_.isFunction(cb)) cb();
            } else {
                message.error(result.msg || OPERATE[type] + targetName + '失败');
            }
        });
    },

    renderForm: function(invoice, index) {
        index = isNaN(index) ? '' : index;
        const ref = 'validation' + index;
        const key = 'formData' + index;
        let formData = this.state[key];

        if (_.isEmpty(formData) && !invoice) {
            let state = this.state;
            formData = state[key] = {contract_id: this.props.contract.id};
            formData.date = moment().valueOf();
            this.setState(state);
        }

        const disabledDate = function(current) {
            //不允许选择大于当前天的日期
            return current && current.valueOf() > Date.now();
        };

        return (
            <div className="render-form">
                <Validation ref={ref} onValidate={this.handleValidate}>
                    <FormItem
                        validateStatus={this.getValidateStatus('date' + index)}
                        help={this.getHelpMessage('date' + index)}
                    >
                        <DatePicker
                            name={'date' + index}
                            onChange={this.setField.bind(this, 'date', index)}
                            value={formData.date ? moment(formData.date) : moment()}
                            disabledDate={disabledDate}
                        />
                    </FormItem>
                    &nbsp;
                    <ReactIntl.FormattedMessage id="contract.43" defaultMessage="开出"/>
                    &nbsp;
                    <FormItem
                        validateStatus={this.getValidateStatus('amount' + index)}
                        help={this.getHelpMessage('amount' + index)}
                    >
                        <Validator rules={[{
                            required: true,
                            message: Intl.get('contract.44', '不能为空')
                        }, getNumberValidateRule()]}>
                            <Input
                                name={'amount' + index}
                                value={this.parseAmount(formData.amount)}
                                onChange={this.setField.bind(this, 'amount', index)}
                            />
                        </Validator>
                    </FormItem>
                    &nbsp;
                    <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                    <ReactIntl.FormattedMessage id="contract.46" defaultMessage="发票"/>
                </Validation>
            </div>
        );
    },

    render: function() {
        const invoiceDetail = this.props.contract.invoice_detail || {};
        let invoices = this.props.contract.invoices || [];
        invoices = _.sortBy(invoices, item => item.date).reverse();

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 10},
        };

        //编辑按钮是否显示
        const isEditBtnShow = !this.state.isFormShow && hasPrivilege('CONTRACT_INVOICE_DETAIL_ADD');

        const detailOp = invoiceDetail.id ? 'update' : 'add';

        return (
            <div className="detail-invoice">
                {isEditBtnShow ? (
                    <RightPanelEdit
                        onClick={this.showForm}
                    />
                ) : null}

                {this.state.isFormShow ? (
                    <Form layout='horizontal'>
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('contract.47', '公司全称')}
                                validateStatus={this.getValidateStatus('payer_name')}
                                help={this.getHelpMessage('payer_name')}
                            >
                                <Validator rules={[{required: true, message: Intl.get('contract.48', '请填写公司全称')}]}>
                                    <Input
                                        name="payer_name"
                                        value={this.state.formData.payer_name}
                                        onChange={this.setField.bind(this, 'payer_name')}
                                    />
                                </Validator>
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('contract.49', '银行帐号')}
                            >
                                <Input
                                    value={this.state.formData.account_number}
                                    onChange={this.setField.bind(this, 'account_number')}
                                />
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('contract.50', '开户行')}
                            >
                                <Input
                                    value={this.state.formData.opening_bank}
                                    onChange={this.setField.bind(this, 'opening_bank')}
                                />
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('realm.address', '地址')}
                            >
                                <Input
                                    value={this.state.formData.address}
                                    onChange={this.setField.bind(this, 'address')}
                                />
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('common.phone', '电话')}
                            >
                                <Input
                                    value={this.state.formData.phone}
                                    onChange={this.setField.bind(this, 'phone')}
                                />
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('contract.51', '邮寄地址')}
                            >
                                <Input
                                    value={this.state.formData.email_address}
                                    onChange={this.setField.bind(this, 'email_address')}
                                />
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('contract.52', '营业执照号码')}
                            >
                                <Input
                                    value={this.state.formData.business_license_id}
                                    onChange={this.setField.bind(this, 'business_license_id')}
                                />
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('contract.53', '组织机构代码')}
                            >
                                <Input
                                    value={this.state.formData.organization_id}
                                    onChange={this.setField.bind(this, 'organization_id')}
                                />
                            </FormItem>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('contract.54', '纳税人识别号')}
                            >
                                <Input
                                    value={this.state.formData.taxpayer_id}
                                    onChange={this.setField.bind(this, 'taxpayer_id')}
                                />
                            </FormItem>
                            <div className="op-buttons">
                                <RightPanelCancel onClick={this.hideForm}><ReactIntl.FormattedMessage id="common.cancel"
                                    defaultMessage="取消"/></RightPanelCancel>
                                <RightPanelSubmit
                                    onClick={this.handleSubmit.bind(this, detailOp, '', '')}><ReactIntl.FormattedMessage
                                        id="common.sure" defaultMessage="确定"/></RightPanelSubmit>
                            </div>
                        </Validation>
                    </Form>
                ) : (
                    <div className="invoice-info">
                        {invoiceDetail.payer_name ? (
                            <div className="info">
                                <span className="field-name"><ReactIntl.FormattedMessage id="contract.47"
                                    defaultMessage="公司全称"/></span>：<span
                                    className="filed-value">{invoiceDetail.payer_name}</span><br/>
                                <span className="field-name"><ReactIntl.FormattedMessage id="contract.49"
                                    defaultMessage="银行帐号"/></span>：<span
                                    className="filed-value">{invoiceDetail.account_number}</span><br/>
                                <span className="field-name"><ReactIntl.FormattedMessage id="contract.50"
                                    defaultMessage="开户行"/></span>：<span
                                    className="filed-value">{invoiceDetail.opening_bank}</span><br/>
                                <span className="field-name"><ReactIntl.FormattedMessage id="realm.address"
                                    defaultMessage="地址"/></span>：<span
                                    className="filed-value">{invoiceDetail.address}</span><br/>
                                <span className="field-name"><ReactIntl.FormattedMessage id="common.phone"
                                    defaultMessage="电话"/></span>：<span
                                    className="filed-value">{invoiceDetail.phone}</span><br/>
                                <span className="field-name"><ReactIntl.FormattedMessage id="contract.51"
                                    defaultMessage="邮寄地址"/></span>：<span
                                    className="filed-value">{invoiceDetail.email_address}</span><br/>
                                <span className="field-name"><ReactIntl.FormattedMessage id="contract.52"
                                    defaultMessage="营业执照号码"/></span>：<span
                                    className="filed-value">{invoiceDetail.business_license_id}</span><br/>
                                <span className="field-name"><ReactIntl.FormattedMessage id="contract.53"
                                    defaultMessage="组织机构代码"/></span>：<span
                                    className="filed-value">{invoiceDetail.organization_id}</span><br/>
                                <span className="field-name"><ReactIntl.FormattedMessage id="contract.54"
                                    defaultMessage="纳税人识别号"/></span>：<span
                                    className="filed-value">{invoiceDetail.taxpayer_id}</span>
                            </div>
                        ) : (
                            <div className="info info-blank">
                                <ReactIntl.FormattedMessage id="contract.add.invoice.info"
                                    defaultMessage="发票基本信息尚未添加，可点击后面的编辑按钮进行添加"/>

                            </div>
                        )}
                        <div className="extra">
                            {hasPrivilege('CONTRACT_ADD_INVOICE_AMOUNT') ? (
                                <div className="add-invoice">
                                    {this.renderForm('', 0)}
                                    <Button
                                        className="btn-primary-sure btn-add-invoice"
                                        onClick={this.handleSubmit.bind(this, 'add', 0, 'Amount')}
                                    >
                                        <ReactIntl.FormattedMessage id="common.add" defaultMessage="添加"/>
                                    </Button>
                                </div>
                            ) : null}
                            <ul>
                                {invoices.map((invoice, index) => {
                                    index = index + 1;
                                    const isFormShow = this.state['isFormShow' + index];

                                    return (
                                        <li key={index}>
                                            {isFormShow ? (
                                                <span>
                                                    {this.renderForm(invoice, index)}
                                                </span>
                                            ) : (
                                                <span>
                                                    {invoice.date ? moment(invoice.date).format(DATE_FORMAT) : ''}
                                                    &nbsp;
                                                    <ReactIntl.FormattedMessage id="contract.43" defaultMessage="开出"/>
                                                    &nbsp;
                                                    {invoice.amount}
                                                    &nbsp;
                                                    <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                                                    <ReactIntl.FormattedMessage id="contract.46" defaultMessage="发票"/>
                                                </span>
                                            )}

                                            {hasPrivilege('CONTRACT_ADD_INVOICE_AMOUNT') ? (
                                                <span>
                                                    {isFormShow ? (
                                                        <span>
                                                            <Button
                                                                shape="circle"
                                                                title={Intl.get('common.save', '保存')}
                                                                className="btn-save"
                                                                onClick={this.handleSubmit.bind(this, 'update', index, 'Amount', invoice.id)}
                                                            >
                                                                <Icon type="save"/>
                                                            </Button>
                                                            <Button
                                                                shape="circle"
                                                                className="btn-cancel"
                                                                title={Intl.get('common.cancel', '取消')}
                                                                onClick={this.hideForm.bind(this, index)}
                                                            >
                                                                <Icon type="cross"/>
                                                            </Button>
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            <RightPanelEdit
                                                                onClick={this.showForm.bind(this, index, invoice)}
                                                            />
                                                            <RightPanelDelete
                                                                title={Intl.get('common.delete', '删除')}
                                                                onClick={this.handleSubmit.bind(this, 'delete', index, 'Amount', invoice.id)}
                                                            />
                                                        </span>
                                                    )}
                                                </span>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        );
    },
});

module.exports = DetailInvoice;


