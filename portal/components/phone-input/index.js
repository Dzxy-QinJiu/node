/**
 * 电话输入框组件
 */

import { addHyphenToPhoneNumber } from "LIB_DIR/func";
import { Form, Input } from "antd";
const FormItem = Form.Item;
const noop = function () {};
let instanceMap = {};

class PhoneInput extends React.Component {
    componentDidMount() {
        //创建实例对象，用以存储该实例相关的临时数据
        instanceMap[this.props.id] = { initialValue: this.props.initialValue };
    }

    componentWillUnmount() {
        //删除实例对象
        delete instanceMap[this.props.id];
    }

    getValidator() {
        return (rule, value, callback) => {
            value = value.trim();

            //空值不做校验
            if (!value) {
                callback();
                return;
            }

            if (
                /^1[345678]\d{9}$/.test(value)
                ||
                /^(0\d{2,3}-?)?[02-9]\d{6,7}$/.test(value)
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

        rules = this.props.validateRules.concat(rules);

        return rules;
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <FormItem
                label={this.props.label ? this.props.label: Intl.get("common.phone", "电话")}
                colon={this.props.colon}
                key={this.props.id}
                labelCol={this.props.labelCol}
                wrapperCol={this.props.wrapperCol}
            >
                {getFieldDecorator(this.props.id, {
                    initialValue: addHyphenToPhoneNumber(this.props.initialValue),
                    rules: this.getRules(),
                    validateTrigger: "onBlur",
                    validateFirst: true,
                })(
                    <Input
                        placeholder={this.props.placeholder}
                        data-tracename="填写新建联系人的电话"
                    />
                )}
                {this.props.suffix}
            </FormItem>
        );
    }
}

PhoneInput.defaultProps = {
    label:"",
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: "",
    initialValue: "",
    colon: true,
    suffix: null,
    onChange: noop,
    validateRules: [],
};

const options = {
    onFieldsChange(props, fields) {
        if (_.isEmpty(fields) || !instanceMap[props.id]) return;

        //暂存变化了的字段
        instanceMap[props.id].changedFields = fields;

        let value = fields[props.id].value;
        let obj = { target: {} };
        obj.target.value = value.replace(/-/g, "");

        props.onChange(obj);
    },
    mapPropsToFields(props) {
        let instance = instanceMap[props.id];

        if (instance && instance.changedFields) {
            let currentValue = instance.changedFields[props.id].value;
            const lastValue = instance.lastValue;
            const lastSaveTime = instance.saveTime || 0;
            const interval = new Date().getTime() - lastSaveTime;

            //win10自带中文输入法下，添加区号分隔符后，会自动在分隔符后加上一位数字，这里对这种情况做一下处理
            if (lastValue && /-$/.test(lastValue) && /-\d$/.test(currentValue) && interval < 100) {
                currentValue = currentValue.replace(/\d$/, "");
            }

            if (_.indexOf(instance.lastValue, "-") === -1) {
                currentValue = addHyphenToPhoneNumber(currentValue, instance.initialValue);
            }

            instance.lastValue = instance.changedFields[props.id].value = currentValue;
            instance.saveTime = new Date().getTime();

            //将暂存的变化了的字段数据返回给表单项，以实现将处理后的值显示出来
            return instance.changedFields;
        }
    },
};

export default Form.create(options)(PhoneInput);

