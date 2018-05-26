const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
/**
 * 计划回款信息添加表单
 */

import { Form, Input, Select, Button, Icon } from "antd";
const FormItem = Form.Item;
const Option = Select.Option;
import ValidateMixin from "../../../mixins/ValidateMixin";
import { numberAddNoMoreThan } from "../../../lib/validator/rules";

const AddRepayment = React.createClass({
    mixins: [ValidateMixin],
    getInitialFormData: function() {
        return {
            type: "repay_plan",
            unit: "days",
        };
    },
    getInitialState: function() {
        return {
            repayments: [],
            formData: this.getInitialFormData(),
        };
    },
    addRepayment: function() {
        this.refs.validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                delete this.state.formData.unit;
                this.state.repayments.push(_.clone(this.state.formData));
                this.state.formData = this.getInitialFormData();
                this.setState(this.state, () => {
                    this.props.updateScrollBar();
                });
            }
        });
    },
    deleteRepayment: function(index) {
        this.state.repayments.splice(index, 1);

        this.setState(this.state);
    },
    onNumChange: function(e) {
        const num = e.target.value;
        this.state.formData.num = num;

        if (!isNaN(num)) {
            const count = parseInt(num);
            const signDate = this.props.rightPanel.refs.addBasic.state.formData.date;
            this.state.formData.date = moment(signDate).add(count, this.state.formData.unit).valueOf();
        }

        this.setState(this.state);
    },
    onUnitChange: function(value) {
        this.state.formData.unit = value;

        const num = this.state.formData.num;

        if (!isNaN(num)) {
            const signDate = this.props.rightPanel.refs.addBasic.state.formData.date;
            const count = parseInt(num);
            this.state.formData.date = moment(signDate).add(count, value).valueOf();
        }

        this.setState(this.state);
    },
    render: function() {
        //合同额
        const contractAmount = this.props.parent.refs.addBasic.state.formData.contract_amount;
        //已添加的回款总额
        let repaymentsAmount = 0;
        const repayments = this.state.repayments;

        if (repayments.length) {
            repaymentsAmount = _.reduce(repayments, (memo, repayment) => {
                const num = parseFloat(repayment.amount);
                return memo + num;
            }, 0);
        }

        return (
            <div className="add-repayments">
                <div className="add-finance">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <ReactIntl.FormattedMessage id="contract.78" defaultMessage="从签订日起" />
                        <FormItem 
                            validateStatus={this.getValidateStatus("num")}
                            help={this.getHelpMessage("num")}
                        >
                            <Validator rules={[{required: true, message: Intl.get("contract.44", "不能为空")}, {pattern: /^\d+$/, message: Intl.get("contract.45", "请填写数字")}]}>
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
                    内，应收回款
                        <FormItem 
                            validateStatus={this.getValidateStatus("amount")}
                            help={this.getHelpMessage("amount")}
                        >
                            <Validator rules={[{required: true, message: Intl.get("contract.44", "不能为空")}, this.getNumberValidateRule(), numberAddNoMoreThan.bind(this, contractAmount, repaymentsAmount, Intl.get("contract.161", "已超合同额"))]}>
                                <Input
                                    name="amount"
                                    value={this.state.formData.amount}
                                    onChange={this.setField.bind(this, "amount")}
                                />
                            </Validator>
                        </FormItem>
                        <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元" />
                        <Button
                            className="btn-primary-sure"
                            onClick={this.addRepayment}
                        >
                            <ReactIntl.FormattedMessage id="common.add" defaultMessage="添加" />
                        </Button>
                    </Validation>
                </div>

                {this.state.repayments.length ? (
                    <div className="finance-list">
                        <ul>
                            {this.state.repayments.map((repayment, index) => { return (
                                <li key={index}>
                                    <div className="circle-button circle-button-minus"
                                        title={Intl.get("common.delete", "删除")}
                                        onClick={this.deleteRepayment.bind(this, index)}>
                                        <Icon type="minus"/>
                                    </div>
                                    {Intl.get("contract.83", "至")}{moment(repayment.date).format(oplateConsts.DATE_FORMAT)} {Intl.get("contract.94", "应收金额")}{repayment.amount}{Intl.get("contract.155", "元")}
                                </li>
                            );})}
                        </ul>
                    </div>
                ) : null}
            </div>
        );
    }
});

module.exports = AddRepayment;

