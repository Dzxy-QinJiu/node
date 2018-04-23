const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
/**
 * 服务信息添加表单
 */

import { Form, Input, Select, Button } from "antd";
const FormItem = Form.Item;
const Option = Select.Option;
import ValidateMixin from "../../../mixins/ValidateMixin";
import { REPORT_SERVICE, SERVICE_TYPE, REPORT_TYPE } from "../consts";

const AddReport = React.createClass({
    mixins: [ValidateMixin],
    getInitialState: function () {
        return {
            reports: [{}],
            formData: {},
        };
    },
    addReport: function () {
        this.state.reports.push({});

        this.setState(this.state, () => {
            this.props.updateScrollBar();
        });
    },
    setField2: function (field, index, e) {
        let value = _.isObject(e)? e.target.value : e;
        const currentItem = this.state.reports[index];
        currentItem[field] = value;

        if (field === "report_type") {
            delete currentItem["num"];
        }

        if (field === "num") {
            delete currentItem["report_type"];
        }

        this.setState(this.state);
    },
    render: function () {
        const reports = this.state.reports;

        const serviceTypeOption = SERVICE_TYPE.map(type => {
            return (
                <Option
                    key={type}
                    value={type}
                >
                    {type}
                </Option>
            );
        });

        const reportTypeOption = REPORT_TYPE.map(type => {
            return (
                <Option
                    key={type}
                    value={type}
                >
                    {type}
                </Option>
            );
        });

        return (
            <div className="add-products">
                <div className="add-product">
                    <Button
                        className="btn-primary-sure"
                        onClick={this.addReport}
                    >
                        <ReactIntl.FormattedMessage id="sales.team.add.sales.team" defaultMessage="添加" />
                    </Button>
                </div>
                <div className="product-forms">
                <Validation ref="validation" onValidate={this.handleValidate}>
                {reports.map((report, index) => {
                    return (
                        <Form key={index}>
                            <FormItem 
                                 label={Intl.get("contract.75", "服务类型")}
                            >
                                <Select
                                    placeholder={Intl.get("contract.76", "请选择类型")}
                                    value={report.type}
                                    onChange={this.setField2.bind(this, "type", index)}
                                >
                                    {serviceTypeOption}
                                </Select>
                            </FormItem>
                            {report.type === REPORT_SERVICE? (
                            <FormItem 
                                 label={Intl.get("contract.77", "报告类型")}
                            >
                                <Select
                                    placeholder={Intl.get("contract.76", "请选择类型")}
                                    value={report.report_type}
                                    onChange={this.setField2.bind(this, "report_type", index)}
                                >
                                    {reportTypeOption}
                                </Select>
                            </FormItem>
                            ) : null}
                            {report.type !== REPORT_SERVICE? (
                            <FormItem 
                                 label="数量（个）"
                                 validateStatus={this.getValidateStatus("num" + index)}
                                 help={this.getHelpMessage("num" + index)}
                            >
                                <Validator rules={[{pattern: /^\d+$/, message: Intl.get("contract.45", "请填写数字")}]}>
                                <Input
                                    name={"num" + index}
                                    value={report.num}
                                    onChange={this.setField2.bind(this, "num", index)}
                                />
                                </Validator>
                            </FormItem>
                            ) : null}
                            <FormItem 
                                 label="总价"
                                 validateStatus={this.getValidateStatus("total_price" + index)}
                                 help={this.getHelpMessage("total_price" + index)}
                            >
                                <Validator rules={[this.getNumberValidateRule()]}>
                                <Input
                                    name={"total_price" + index}
                                    value={report.total_price}
                                    onChange={this.setField2.bind(this, "total_price", index)}
                                />
                                </Validator>
                            </FormItem>
                            <FormItem 
                                label={Intl.get("contract.141", "提成比例")}
                                validateStatus={this.getValidateStatus("commission_rate" + index)}
                                help={this.getHelpMessage("commission_rate" + index)}
                            >
                                <Validator rules={[this.getNumberValidateRule()]}>
                                <Input
                                    name={"commission_rate" + index}
                                    value={(isNaN(report.commission_rate)? "" : report.commission_rate).toString()}
                                    onChange={this.setField2.bind(this, "commission_rate", index)}
                                />
                                </Validator>
                                &nbsp;%
                            </FormItem>
                        </Form>
                    );
                })}
                </Validation>
                </div>
            </div>
        );
    }
});

module.exports = AddReport;

