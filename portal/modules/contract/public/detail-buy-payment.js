var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 已付款信息展示及编辑页面
 */

import {Form, Input, Button, DatePicker, Icon, message} from 'antd';
const FormItem = Form.Item;
import ValidateMixin from '../../../mixins/ValidateMixin';
const hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
import rightPanelUtil from '../../../components/rightPanel';
const RightPanelEdit = rightPanelUtil.RightPanelEdit;
const RightPanelDelete = rightPanelUtil.RightPanelDelete;
const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
const RightPanelCancel = rightPanelUtil.RightPanelCancel;
import {DATE_FORMAT, OPERATE} from '../consts';
import routeList from '../common/route';
import ajax from '../common/ajax';
import GeminiScrollBar from '../../../components/react-gemini-scrollbar';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
const DetailBuyPayment = createReactClass({
    displayName: 'DetailBuyPayment',
    mixins: [ValidateMixin],

    componentDidMount: function() {
        $(window).on('resize', this.setContentHeight);
        //加一个延时，等dom渲染完后再设置内容高度，否则会设置不正确
        setTimeout(() => {
            this.setContentHeight();
        });
    },

    componentWillUnmount: function() {
        $(window).off('resize', this.setContentHeight);
    },

    setContentHeight: function() {
        const wrapper = $('.finance-list');
        //新高度 = 窗口高度 - 容器距窗口顶部的距离 - 底部留空
        wrapper.height($(window).height() - wrapper.offset().top - 20);
        this.refs.gemiScrollBar.update();
    },

    showForm: function(index, payment) {
        const key = 'formData' + index;
        this.state[key] = _.clone(payment);
        this.state['isFormShow' + index] = true;
        this.setState(this.state);
    },

    hideForm: function(index) {
        this.state['isFormShow' + index] = false;
        this.setState(this.state);
    },

    handleSubmit: function(type, index, id) {
        let data, params;

        if (type === 'delete') {
            params = {id: id};
            this.editPayment(type, data, params, null, id);
        } else if (type === 'add' || type === 'update') {
            if (isNaN(index)) index = '';
            data = this.state['formData' + index];
            // 如果没有选日期则默认为当天
            if (!data.date) {
                data.date = new Date().getTime();
            }
            const params = {contractId: this.props.contract.id};

            this.refs['validation' + index].validate(valid => {
                if (!valid) {
                    return;
                } else {
                    this.editPayment(type, data, params, () => {
                        //清空表单
                        this.state['formData' + index] = {};
                        this.setState(this.state);
                        if (type === 'update') {
                            this.hideForm(index);
                        }
                    }, id);
                }
            });
        }
    },

    editPayment: function(type, data, params, cb, id) {
        this.props.showLoading();

        const handler = type + 'Payment';
        const route = _.find(routeList, route => route.handler === handler);
        let arg = {
            url: route.path,
            type: route.method,
            data: data,
        };
        if (params) arg.params = params;

        ajax(arg).then(result => {
            this.props.hideLoading();

            message.success(OPERATE[type] + '成功');
            this.props.refreshCurrentContractNoAjax('payments', type, result.result, id);
            if (_.isFunction(cb)) cb();
        }, errorObj => {
            this.props.hideLoading();

            message.error(errorObj.message || OPERATE[type] + '失败');
        });
    },

    renderForm: function(payment, index) {
        index = isNaN(index) ? '' : index;
        const ref = 'validation' + index;
        const key = 'formData' + index;
        let formData = this.state[key];

        if (!formData && !payment) {
            let state = this.state;
            formData = state[key] = {};
            this.setState(state);
        }

        const disabledDate = function(current) {
            //不允许选择大于当前天的日期
            return current && current.valueOf() > Date.now();
        };

        return (
            <Validation ref={ref} onValidate={this.handleValidate}>
                <FormItem
                    validateStatus={this.getValidateStatus('date' + index)}
                    help={this.getHelpMessage('date' + index)}
                >
                    <DatePicker
                        allowClear={false}
                        name={'date' + index}
                        onChange={this.setField.bind(this, 'date', index)}
                        value={formData.date ? moment(formData.date) : moment()}
                        disabledDate={disabledDate}
                    />
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.91" defaultMessage="付款"/>
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
                {Intl.get('contract.155', '元')}
            </Validation>
        );
    },

    render: function() {
        let payments = this.props.contract.payments || [];
        payments = _.sortBy(payments, item => item.date).reverse();
        return (
            <div className="detail-payments">
                {hasPrivilege('OPLATE_PAYMENT_ADD') ? (
                    <div className="add-finance">
                        {this.renderForm()}
                        <Button
                            className="btn-primary-sure"
                            onClick={this.handleSubmit.bind(this, 'add')}
                        >
                            <ReactIntl.FormattedMessage id="contract.92" defaultMessage="添加付款"/>
                        </Button>
                    </div>
                ) : null}

                <div className="finance-list">
                    <GeminiScrollBar ref="gemiScrollBar">
                        <ul>
                            {payments.map((payment, index) => {
                                const isFormShow = this.state['isFormShow' + index];

                                return (
                                    <li key={index}>
                                        {isFormShow ? (
                                            <span className="add-finance">
                                                {this.renderForm(payment, index)}
                                            </span>
                                        ) : (
                                            <span>
                                                {payment.date ? moment(payment.date).format(DATE_FORMAT) : ''}
                                                &nbsp;
                                                <ReactIntl.FormattedMessage id="contract.91" defaultMessage="付款"/>
                                                {payment.amount}
                                                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                                            </span>
                                        )}

                                        {hasPrivilege('OPLATE_PAYMENT_ADD') ? (
                                            <span>
                                                {isFormShow ? (
                                                    <span>
                                                        <Button
                                                            shape="circle"
                                                            title={Intl.get('common.save', '保存')}
                                                            className="btn-save"
                                                            onClick={this.handleSubmit.bind(this, 'update', index, payment.id)}
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
                                                            onClick={this.showForm.bind(this, index, payment)}
                                                        />
                                                        <RightPanelDelete
                                                            title={Intl.get('common.delete', '删除')}
                                                            onClick={this.handleSubmit.bind(this, 'delete', index, payment.id)}
                                                        />
                                                    </span>
                                                )}
                                            </span>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    </GeminiScrollBar>
                </div>
            </div>
        );
    },
});

module.exports = DetailBuyPayment;


