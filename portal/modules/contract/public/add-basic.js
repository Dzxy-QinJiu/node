const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
/**
 * 销售合同基本信息添加表单
 */

import { Form, Input, Select, DatePicker, Radio } from "antd";
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
import ValidateMixin from "../../../mixins/ValidateMixin";
import BasicMixin from "./mixin-basic";

const AddBasic = React.createClass({
    mixins: [ValidateMixin, BasicMixin],
    render: function() {
        const formData = this.state.formData;

        let copyNumArray = [];
        for (let i = 1; i < 11; i++) {
            copyNumArray.push(i);
        }

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 },
        };

        const formItemLayout2 = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 },
        };

        //成本额默认为0
        if (isNaN(formData.cost_price)) formData.cost_price = 0;

        //根据合同额和成本额计算毛利
        let calProfit = formData.contract_amount - formData.cost_price;
        if (isNaN(calProfit) || calProfit < 0) calProfit = "0";
        formData.gross_profit = parseFloat(calProfit).toFixed(2);

        if (!formData.need_invoice) formData.need_invoice = "true";

        return (
            <Form horizontal className="add-basic" data-tracename="添加合同>基本信息">
                <Validation ref="validation" onValidate={this.handleValidate}>
                    {this.renderNumField()}
                    {this.renderCustomerField()}
                    {this.renderBuyerField()}
                    {this.renderUserField()}
                    {this.renderTeamField()}
                    {this.renderAmountField()}
                    <FormItem 
                        {...formItemLayout2}
                        label={Intl.get("contract.153", "成本额")}
                        validateStatus={this.getValidateStatus("cost_price")}
                        help={this.getHelpMessage("cost_price")}
                    >
                        <Validator rules={[this.getNumberValidateRule()]}>
                            <Input
                                name="cost_price"
                                value={this.parseAmount(formData.cost_price)}
                                onChange={this.setField.bind(this, "cost_price")}
                            />
                        </Validator>
                    </FormItem>
                    <FormItem 
                        {...formItemLayout2}
                        label={Intl.get("contract.165", "成本构成")}
                    >
                        <Input
                            name="cost_structure"
                            value={this.parseAmount(formData.cost_structure)}
                            onChange={this.setField.bind(this, "cost_structure")}
                        />
                    </FormItem>
                    <FormItem 
                        {...formItemLayout2}
                        label={Intl.get("contract.154", "合同毛利")}
                        validateStatus={this.getValidateStatus("gross_profit")}
                        help={this.getHelpMessage("gross_profit")}
                    >
                        <Validator rules={[this.getNumberValidateRule()]}>
                            <Input
                                name="gross_profit"
                                disabled
                                value={formData.gross_profit}
                            />
                        </Validator>
                    </FormItem>
                    {this.renderDateField()}
                    <FormItem 
                        {...formItemLayout}
                        label={Intl.get("contract.35", "起始时间")}
                    >
                        <DatePicker
                            value={formData.start_time? moment(formData.start_time) : ""}
                            onChange={this.setField.bind(this, "start_time")}
                        />
                    </FormItem>
                    <FormItem 
                        {...formItemLayout}
                        label={Intl.get("contract.105", "结束时间")}
                    >
                        <DatePicker
                            value={formData.end_time? moment(formData.end_time) : ""}
                            onChange={this.setField.bind(this, "end_time")}
                        />
                    </FormItem>
                    <FormItem 
                        {...formItemLayout2}
                        label={Intl.get("contract.106", "份数（份）")}
                    >
                        <Select
                            placeholder="1--10"
                            value={formData.copy_number}
                            onChange={this.setField.bind(this, "copy_number")}
                        >
                            {copyNumArray.map(copyNum => { return (
                                <Option key={copyNum} value={copyNum}>{copyNum}</Option>
                            );})}
                        </Select>
                    </FormItem>
                    <FormItem 
                        {...formItemLayout2}
                        label={Intl.get("contract.107", "开发票")}
                    >
                        <RadioGroup
                            value={formData.need_invoice}
                            onChange={this.setField.bind(this, "need_invoice")}
                        >
                            <Radio key="1" value="true"><ReactIntl.FormattedMessage id="user.yes" defaultMessage="是" /></Radio>
                            <Radio key="2" value="false"><ReactIntl.FormattedMessage id="user.no" defaultMessage="否" /></Radio>
                        </RadioGroup>
                    </FormItem>
                    {this.renderStageField()}
                    {this.renderLabelField()}
                    {formData.category? this.renderCategoryField() : null}
                    {this.renderRemarksField()}
                    {this.renderBelongCustomerField()}
                </Validation>
            </Form>
        );
    }
});

module.exports = AddBasic;

