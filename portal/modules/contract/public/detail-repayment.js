var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 已回款信息展示及编辑页面
 */

import {Form, Input, Button, DatePicker, Icon, message, Checkbox} from 'antd';
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
import {numberAddNoMoreThan,getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';

const DetailRepayment = createReactClass({
    displayName: 'DetailRepayment',
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

    showForm: function(index, repayment) {
        const key = 'formData' + index;
        this.state[key] = _.clone(repayment);
        this.state['isFormShow' + index] = true;
        this.setState(this.state);
    },

    hideForm: function(index) {
        this.state['isFormShow' + index] = false;
        this.setState(this.state);
    },

    handleSubmit: function(type, index, id) {
        let data;

        if (type === 'delete') {
            data = [id];
            this.editRepayment(type, data);
        } else if (type === 'add' || type === 'update') {
            if (isNaN(index)) index = '';
            data = this.state['formData' + index];
            const params = {contractId: this.props.contract.id, type: 'repay'};

            this.refs['validation' + index].validate(valid => {
                if (!valid) {
                    return;
                } else {
                    this.editRepayment(type, data, params, () => {
                        //清空表单
                        this.state['formData' + index] = {};
                        this.setState(this.state);
                        if (type === 'update') {
                            this.hideForm(index);
                        }
                    });
                }
            });
        }
    },

    editRepayment: function(type, data, params, cb) {
        this.props.showLoading();

        const handler = type + 'Repayment';
        const route = _.find(routeList, route => route.handler === handler);
        let arg = {
            url: route.path,
            type: route.method,
            data: data,
        };
        if (params) arg.params = params;

        ajax(arg).then(result => {
            this.props.hideLoading();

            if (result.code === 0) {
                message.success(OPERATE[type] + '成功');
                this.props.refreshCurrentContract(this.props.contract.id);
                if (_.isFunction(cb)) cb();
            } else {
                message.error(result.msg || OPERATE[type] + '失败');
            }
        });
    },

    renderForm: function(repayment, index) {
        index = isNaN(index) ? '' : index;
        const ref = 'validation' + index;
        const key = 'formData' + index;
        let formData = this.state[key];

        if (!formData && !repayment) {
            let state = this.state;
            formData = state[key] = {type: 'repay'};
            formData.date = moment().valueOf();
            formData.contract_date = this.props.contract.date;
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
                        name={'date' + index}
                        onChange={this.setField.bind(this, 'date', index)}
                        value={formData.date ? moment(formData.date) : moment()}
                        disabledDate={disabledDate}
                    />
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.108" defaultMessage="回款"/>
                <FormItem
                    validateStatus={this.getValidateStatus('amount' + index)}
                    help={this.getHelpMessage('amount' + index)}
                >
                    <Validator rules={[{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }, getNumberValidateRule(), numberAddNoMoreThan.bind(this, this.props.contract.contract_amount, this.props.contract.total_amount, Intl.get('contract.161', '已超合同额'))]}>
                        <Input
                            name={'amount' + index}
                            value={this.parseAmount(formData.amount)}
                            onChange={this.setField.bind(this, 'amount', index)}
                        />
                    </Validator>
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>,
                <ReactIntl.FormattedMessage id="contract.109" defaultMessage="毛利"/>
                <FormItem
                    validateStatus={this.getValidateStatus('gross_profit' + index)}
                    help={this.getHelpMessage('gross_profit' + index)}
                >
                    <Validator rules={[{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }, getNumberValidateRule()]}>
                        <Input
                            name={'gross_profit' + index}
                            value={this.parseAmount(formData.gross_profit)}
                            onChange={this.setField.bind(this, 'gross_profit', index)}
                        />
                    </Validator>
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                <FormItem
                >
                    <Checkbox
                        name="is_first"
                        checked={['true', true].indexOf(formData.is_first) > -1}
                        onChange={this.setField.bind(this, 'is_first', index)}
                    >
                        {Intl.get('contract.167', '首笔回款')}
                    </Checkbox>
                </FormItem>
            </Validation>
        );
    },

    render: function() {
        let repayments = this.props.contract.repayments || [];
        repayments = _.sortBy(repayments, item => item.date).reverse();
        return (
            <div className="detail-repayments">
                {hasPrivilege('OPLATE_REPAYMENT_ADD') ? (
                    <div className="add-finance">
                        {this.renderForm()}
                        <Button
                            className="btn-primary-sure"
                            onClick={this.handleSubmit.bind(this, 'add')}
                        >
                            <ReactIntl.FormattedMessage id="common.add" defaultMessage="添加"/>
                        </Button>
                    </div>
                ) : null}

                <div className="finance-list">
                    <GeminiScrollBar ref="gemiScrollBar">
                        <ul>
                            {repayments.map((repayment, index) => {
                                const isFormShow = this.state['isFormShow' + index];

                                return (
                                    <li key={index}>
                                        {isFormShow ? (
                                            <span className="add-finance">
                                                {this.renderForm(repayment, index)}
                                            </span>
                                        ) : (
                                            <span>
                                                {repayment.date ? moment(repayment.date).format(DATE_FORMAT) : ''}
                                                &nbsp;
                                                <ReactIntl.FormattedMessage id="contract.108" defaultMessage="回款"/>
                                                {repayment.amount || 0}
                                                <ReactIntl.FormattedMessage id="contract.155"
                                                    defaultMessage="元"/>，<ReactIntl.FormattedMessage
                                                    id="contract.109" defaultMessage="毛利"/>
                                                {repayment.gross_profit || 0}
                                                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                                                {repayment.is_first === 'true' ? (
                                                    <span>
                                        , <ReactIntl.FormattedMessage id="contract.167" defaultMessage="首笔回款"/>
                                                    </span>
                                                ) : null}
                                            </span>
                                        )}

                                        {hasPrivilege('OPLATE_REPAYMENT_ADD') ? (
                                            <span>
                                                {isFormShow ? (
                                                    <span>
                                                        <Button
                                                            shape="circle"
                                                            title={Intl.get('common.save', '保存')}
                                                            className="btn-save"
                                                            onClick={this.handleSubmit.bind(this, 'update', index)}
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
                                                            onClick={this.showForm.bind(this, index, repayment)}
                                                        />
                                                        <RightPanelDelete
                                                            title={Intl.get('common.delete', '删除')}
                                                            onClick={this.handleSubmit.bind(this, 'delete', index, repayment.id)}
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

module.exports = DetailRepayment;


