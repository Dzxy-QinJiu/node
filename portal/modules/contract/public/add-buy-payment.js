var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 应付款信息添加表单
 */

import { Form, Input, Select, Button, Icon } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import ValidateMixin from '../../../mixins/ValidateMixin';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';

const AddBuyPayment = createReactClass({
    displayName: 'AddBuyPayment',
    mixins: [ValidateMixin],

    getInitialFormData: function() {
        return {
            unit: 'days',
        };
    },

    getInitialState: function() {
        return {
            payments: [],
            formData: this.getInitialFormData(),
        };
    },

    addPayment: function() {
        this.refs.validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                this.state.payments.push(_.clone(this.state.formData));
                this.state.formData = this.getInitialFormData();
                this.setState(this.state, () => {
                    this.props.updateScrollBar();
                });
            }
        });
    },

    deletePayment: function(index) {
        this.state.payments.splice(index, 1);

        this.setState(this.state);
    },

    onNumChange: function(e) {
        const num = e.target.value;
        this.state.formData.num = num;

        if (!isNaN(num)) {
            const count = parseInt(num);
            const signDate = this.props.rightPanel.refs.addBuyBasic.state.formData.date;
            this.state.formData.date = moment(signDate).add(count, this.state.formData.unit).valueOf();
        }

        this.setState(this.state);
    },

    onUnitChange: function(value) {
        this.state.formData.unit = value;

        const num = this.state.formData.num;

        if (!isNaN(num)) {
            const signDate = this.props.rightPanel.refs.addBuyBasic.state.formData.date;
            const count = parseInt(num);
            this.state.formData.date = moment(signDate).add(count, value).valueOf();
        }

        this.setState(this.state);
    },

    render: function() {
        return (
            <div className="add-payments">
                <div className="add-finance">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <ReactIntl.FormattedMessage id="contract.78" defaultMessage="从签订日起" />
                        <FormItem 
                            validateStatus={this.getValidateStatus('num')}
                            help={this.getHelpMessage('num')}
                        >
                            <Validator rules={[{required: true, message: Intl.get('contract.44', '不能为空')}, {pattern: /^\d+$/, message: Intl.get('contract.45', '请填写数字')}]}>
                                <Input
                                    name="num"
                                    value={this.state.formData.num}
                                    onChange={this.onNumChange}
                                />
                            </Validator>
                        </FormItem>
                        <Select 
                            value={this.state.formData.unit}
                            onChange={this.onUnitChange}
                        >
                            <Option key="days" value="days"><ReactIntl.FormattedMessage id="contract.79" defaultMessage="日" /></Option>
                            <Option key="weeks" value="weeks"><ReactIntl.FormattedMessage id="common.time.unit.week" defaultMessage="周" /></Option>
                            <Option key="months" value="months"><ReactIntl.FormattedMessage id="common.time.unit.month" defaultMessage="月" /></Option>
                        </Select>
                        {Intl.get('contract.80','内')}，
                        {Intl.get('contract.81','应付款')}
                        <FormItem 
                            validateStatus={this.getValidateStatus('amount')}
                            help={this.getHelpMessage('amount')}
                        >
                            <Validator rules={[{required: true, message: Intl.get('contract.44', '不能为空')}, getNumberValidateRule()]}>
                                <Input
                                    name="amount"
                                    value={this.state.formData.amount}
                                    onChange={this.setField.bind(this, 'amount')}
                                />
                            </Validator>
                        </FormItem>
                        <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元" />
                        <Button
                            className="btn-primary-sure"
                            onClick={this.addPayment}
                        >
                            <ReactIntl.FormattedMessage id="sales.team.add.sales.team" defaultMessage={Intl.get('common.add', '添加')} />
                        </Button>
                    </Validation>
                </div>

                {this.state.payments.length ? (
                    <div className="finance-list">
                        <ul>
                            {this.state.payments.map((payment, index) => { return (
                                <li key={index}>
                                    <div className="circle-button circle-button-minus"
                                        title={Intl.get('common.delete', '删除')}
                                        onClick={this.deletePayment.bind(this, index)}>
                                        <Icon type="minus"/>
                                    </div>
                                    {Intl.get('contract.83','至')}
                                    {moment(payment.date).format(oplateConsts.DATE_FORMAT)}
                                    <ReactIntl.FormattedMessage
                                        id="contract.84"
                                        defaultMessage={'应付金额{num}元'}
                                        values={{'num': payment.amount}}
                                    />
                                </li>
                            );})}
                        </ul>
                    </div>
                ) : null}
            </div>
        );
    },
});

module.exports = AddBuyPayment;


