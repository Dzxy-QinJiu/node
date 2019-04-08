const PropTypes = require('prop-types');
var React = require('react');
/**
 * 电话输入框组件
 */
import {commonPhoneRegex, hotlinePhoneRegex, autoLineAreaPhoneRegex, phone1010Regex } from 'PUB_DIR/sources/utils/validate-util';
import { addHyphenToPhoneNumber } from 'LIB_DIR/func';
import { Form, Input } from 'antd';
const FormItem = Form.Item;
const noop = function() {};
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
            value = _.trim(value);

            //空值不做校验
            if (!value) {
                callback();
                return;
            }
            
            let regexFlag = commonPhoneRegex.test(value) ||
                            autoLineAreaPhoneRegex.test(value) ||
                            hotlinePhoneRegex.test(value) ||
                            phone1010Regex.test(value);
            if (this.props.label === Intl.get('user.phone', '手机号')) {
                regexFlag = commonPhoneRegex.test(value);
            }

            if (regexFlag) {
                callback();
            } else {
                //延迟1秒钟后再显示错误信息，以防止一输入就报错
                setTimeout(() => {
                    if (this.props.label === Intl.get('user.phone', '手机号')) {
                        callback(Intl.get('register.phon.validat.tip', '请输入正确的手机号, 格式如:13877775555'));
                    } else {
                        callback(Intl.get('crm.196', '请输入正确的电话号码，格式例如：13877775555，010-77775555 或 400-777-5555'));
                    }
                }, 1000);
            }
        };
    }

    getRules() {
        let rules = [{validator: this.getValidator()}];

        rules = rules.concat(this.props.validateRules);

        return rules;
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <FormItem
                label={this.props.hideLable ? '' : (this.props.label ? this.props.label : Intl.get('common.phone', '电话'))}
                colon={this.props.colon}
                key={this.props.id}
                labelCol={this.props.labelCol}
                wrapperCol={this.props.wrapperCol}
            >
                {getFieldDecorator(this.props.id, {
                    initialValue: addHyphenToPhoneNumber(this.props.initialValue),
                    rules: this.getRules(),
                    validateTrigger: 'onChange',
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
    label: '',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: '',
    initialValue: '',
    colon: true,
    suffix: null,
    onChange: noop,
    validateRules: [],
    hideLable: false,
    id: '',
    form: {}
};
PhoneInput.propTypes = {
    label: PropTypes.string,
    labelCol: PropTypes.object,
    wrapperCol: PropTypes.object,
    placeholder: PropTypes.string,
    initialValue: PropTypes.string,
    colon: PropTypes.bool,
    suffix: PropTypes.object,
    onChange: PropTypes.func,
    validateRules: PropTypes.object,
    hideLable: PropTypes.bool,
    id: PropTypes.string,
    form: PropTypes.object,
};

const options = {
    onFieldsChange(props, fields) {
        if (_.isEmpty(fields) || !instanceMap[props.id]) return;

        //暂存变化了的字段
        instanceMap[props.id].changedFields = fields;
        //标识电话值的变化来自于用户输入而非外部属性变更
        instanceMap[props.id].changeFromInput = true;

        let value = fields[props.id].value;
        let obj = { target: {} };
        obj.target.value = value.replace(/-/g, '');

        props.onChange(obj);
    },
    mapPropsToFields(props) {
        let instance = instanceMap[props.id];

        if (instance && instance.changedFields) {
            //变化了的字段
            const changedField = instance.changedFields[props.id];
            //字段当前值
            let currentValue = changedField.value;

            //如果电话值的变化不是来自用户输入，也即该变化来自外部属性传入
            if (!instance.changeFromInput) {
                //去掉横线后的字段当前值
                const currentValueNoHyphen = currentValue.replace('-', '');
                //去掉横线后的字段属性值
                const propsValueNoHyphen = props.initialValue.replace('-', '');

                //如果传入的值有变化
                if (currentValueNoHyphen !== propsValueNoHyphen) {
                    //将当前值设为传入的值
                    currentValue = props.initialValue;
                    //将实例中暂存的上次的值置空，以便进行加横线的操作
                    instance.lastValue = '';
                    //将实例中暂存的初始值置空，以便进行加横线的操作
                    instance.initialValue = '';
                    //不显示验证加载状态
                    changedField.validating = false;
                }
            } else {
                const lastValue = instance.lastValue;
                const lastSaveTime = instance.saveTime || 0;
                const interval = new Date().getTime() - lastSaveTime;

                //win10自带中文输入法下，添加区号分隔符后，会自动在分隔符后加上一位数字，这里对这种情况做一下处理
                if (lastValue && /-$/.test(lastValue) && /-\d$/.test(currentValue) && interval < 100) {
                    currentValue = currentValue.replace(/\d$/, '');
                }
            }

            //将标识电话值的变化来自于用户输入而非外部属性变更的标志置为false，以便下次使用
            instance.changeFromInput = false;

            if (_.indexOf(instance.lastValue, '-') === -1) {
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

