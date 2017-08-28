/**
 * 电话输入框组件
 */

import { addHyphenToPhoneNumber } from "LIB_DIR/func";
import { Form, Input } from "antd-eefung";
const FormItem = Form.Item;
const noop = function () {};

class PhoneInput extends React.Component {
    getValidator() {
        return (rule, value, callback) => {
            if (
                /^1[34578]\d{9}$/.test(value)
                ||
                /^\d{3,4}-?\d{7,8}$/.test(value)
                ||
                /^400-?\d{3}-?\d{4}$/.test(value)
            ) {
                callback();
            } else {
                callback(Intl.get("crm.196", "请输入正确的电话号码，格式例如：13877775555，010-77775555 或 400-777-5555"));
            }
        };
    }

    getRules() {
        let rules = [{validator: this.getValidator()}];

        rules = rules.concat(this.props.validateRules);

        return rules;
    }

    onChange = (e) => {
        let value = e.target.value;
        const lastValue = this.lastValue || "";

        if (lastValue.indexOf("-") === -1) {
            value = addHyphenToPhoneNumber(value);
            e.target.value = value;
        }

        this.lastValue = value;

        let obj = { target: {} };
        obj.target.value = value.replace(/-/g, "");

        this.props.onChange(obj);
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <FormItem
                label={Intl.get("common.phone", "电话")}
                colon={false}
                key={this.props.key}
                labelCol={this.props.labelCol}
                wrapperCol={this.props.wrapperCol}
            >
                {getFieldDecorator("phone", {
                    initialValue: addHyphenToPhoneNumber(this.props.initialValue),
                    rules: this.getRules(),
                    validateTrigger: "onBlur",
                    validateFirst: true,
                })(
                    <Input
                        placeholder={this.props.placeholder}
                        onChange={this.onChange}
                        data-tracename="填写新建联系人的电话"
                    />
                )}
                {this.props.suffix}
            </FormItem>
        );
    }
}

PhoneInput.defaultProps = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: "",
    initialValue: "",
    key: "phone",
    suffix: null,
    onChange: noop,
    validateRules: [],
};

export default Form.create()(PhoneInput);

