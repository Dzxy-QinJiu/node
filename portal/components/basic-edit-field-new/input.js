const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
/**
 * input(输入框)显示、编辑 的组件
 * 可切换状态
 */
require("./css/basic-edit-field.less");
import {Form, Input, Icon, Button} from "antd";
var crypto = require("crypto");
var classNames = require("classnames");
var secretPassword = "";
var FormItem = Form.Item;
import FieldMixin from "../antd-form-fieldmixin/index";
import {PassStrengthBar} from "../password-strength-bar";
import Trace from "LIB_DIR/trace";
import {DetailEditBtn} from "../rightPanel";

const BasicEditField = React.createClass({
    mixins: [FieldMixin],
    getDefaultProps: function () {
        return {
            id: '1',
            //类型 input、textarea或password
            type: 'input',
            //字段
            field: "email",
            //是否有修改权限
            hasEditPrivilege: false,
            //验证条件
            validators: [{}],
            //请填写
            placeholder: Intl.get("user.email.write.tip", "请填写邮箱"),
            //显示的值
            value: '',
            //编辑按钮的提示文案
            editBtnTip: Intl.get("common.update", "修改"),
            //修改成功
            modifySuccess: function () {
            },
            onDisplayTypeChange: function () {
            },
            onValueChange: function () {
            },
            saveEditInput: function () {
            },
            //行数
            rows: 5,
            //是否展示密码强度
            showPasswordStrength: false,
            //属性值后面紧跟的提示信息
            afterValTip: ''
        };
    },
    getInitialState: function () {
        var type = this.props.type, value = this.props.value;
        if (type === 'password') {
            value = secretPassword;
        }
        return {
            loading: false,
            displayType: this.props.displayType || "text",
            formData: {
                input: this.props.value
            },
            status: {
                input: {}
            },
            value: value,
            submitErrorMsg: '',
            //密码强度
            passStrength: {
                passBarShow: false
            }
        };
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.id !== this.props.id) {
            var type = nextProps.type, value = nextProps.value;
            if (type === 'password') {
                value = secretPassword;
            }
            this.setState({
                value: value,
                formData: {
                    input: value
                }
            });
        }
    },
    setEditable: function (e) {
        var formData = this.state.formData;
        formData.input = this.state.value;
        this.setState({
            displayType: "edit",
            formData: formData,
            passStrength: {
                passBarShow: false
            }
        }, function () {
            var dom = $('input[type="text"],input[type="password"],textarea', this.refs.inputWrap)[0];
            var val = dom.value;
            if (dom.createTextRange) {//IE浏览器
                var range = dom.createTextRange();
                range.moveEnd("character", val.length);
                range.moveStart("character", val.length);
                range.select();
            } else {//非IE浏览器
                dom.setSelectionRange(val.length, val.length);
                dom.focus();
            }
        });
        this.props.onDisplayTypeChange("edit");
        Trace.traceEvent(e, "点击编辑" + this.props.field);
    },
    md5: function (value) {
        var md5Hash = crypto.createHash("md5");
        md5Hash.update(value);
        return md5Hash.digest("hex");
    },
    handleSubmit: function (e) {
        var validation = this.refs.validation;
        Trace.traceEvent(e, "保存对" + this.props.field + "的修改");
        validation.validate(valid => {
            if (!valid) {
                return;
            }
            var value = this.state.formData.input;
            var saveObj = {
                id: this.props.id
            };
            if (this.props.type === 'password') {
                saveObj[this.props.field] = this.md5(value);
            } else {
                saveObj[this.props.field] = value;
            }
            this.setState({loading: true});
            const setDisplayState = () => {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: this.props.type === 'password' ? secretPassword : value,
                    displayType: 'text'
                });
            }
            if ((this.props.type === 'password' && value != secretPassword)
                || (value != this.state.value)) {
                this.props.saveEditInput(saveObj, () => {
                    setDisplayState();
                }, errorMsg => {
                    this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg || Intl.get("common.edit.failed", "修改失败")
                    });
                });
            } else {
                setDisplayState();
            }
        });
    },
    handleCancel: function (e) {
        var oldValue = this.props.type === 'password' ? secretPassword : this.state.value;
        var formData = this.state.formData;
        var status = this.state.status;
        formData.input = oldValue;
        status.input = {};
        this.setState({
            formData: formData,
            status: status,
            displayType: "text",
            submitErrorMsg: ''
        });
        this.props.onDisplayTypeChange("text");
        Trace.traceEvent(e, "取消对" + this.props.field + "的修改");
    },
    onFocusInput: function (type, event) {
        if (type === 'password') {
            var currentValue = event.target.value;
            if (currentValue === secretPassword) {
                var formData = this.state.formData;
                formData.input = '';
                this.setState({
                    formData: formData
                });
            }
        }
    },
    onBlurInput: function (type, event) {
        if (type === 'password') {
            var currentValue = event.target.value;
            if (currentValue === '') {
                var formData = this.state.formData;
                formData.input = secretPassword;
                this.setState({
                    formData: formData
                });
            }
        }
    },
    onInputChange: function (e) {
        this.setField.bind(this, 'input', e);
        this.props.onValueChange();
    },
    render: function () {
        var formData = this.state.formData;
        var status = this.state.status;
        var displayCls = classNames({
            'basic-edit-field-input': this.props.type !== 'textarea',
            'basic-edit-field-textarea': this.props.type === 'textarea',
            'basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });

        var displayText = this.props.type === 'password' ? Intl.get("user.password.tip", "保密中") : this.state.value;

        var textBlock = this.state.displayType === 'text' ? (
            <div>
                <span className="inline-block basic-info-text">
                    {displayText}{this.props.afterValTip ? this.props.afterValTip : ""}
                </span>
                {this.props.hasEditPrivilege ? (
                    <DetailEditBtn title={this.props.editBtnTip}
                                   onClick={this.setEditable.bind(this)}/>) : null
                }
            </div>
        ) : null;

        var buttonBlock = (
            <div className="button-container">
                <Button className="button-save" type="primary"
                        onClick={this.handleSubmit.bind(this)}>
                    {Intl.get("common.save", "保存")}
                </Button>
                <Button className="button-cancel" onClick={this.handleCancel.bind(this)}>
                    {Intl.get("common.cancel", "取消")}
                </Button>
                {this.state.loading ? (
                    <Icon type="loading" className="save-loading"/>) : this.state.submitErrorMsg ? (
                    <span className="save-error">{this.state.submitErrorMsg}</span>
                ) : null}
            </div>);

        var inputBlock = this.state.displayType === 'edit' ? (
            <div className="inputWrap" ref="inputWrap">
                <Form horizontal autoComplete="off">
                    <input type="password" style={{display: "none"}} name="input" autoComplete="off"/>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            label=""
                            labelCol={{span: 0}}
                            wrapperCol={{span: 24}}
                            validateStatus={this.renderValidateStyle('input')}
                            help={status.input.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.input.errors && status.input.errors.join(','))}
                        >
                            <Validator rules={this.props.validators}>
                                {this.props.type === 'textarea' ?
                                    <Input name="input"
                                           autosize={{minRows: 2, maxRows: 6}}
                                           type={this.props.type}
                                           placeholder={this.props.placeholder}
                                           value={formData.input}
                                           onChange={this.onInputChange}
                                           autoComplete="off"
                                           onFocus={this.onFocusInput.bind(this, this.props.type)}
                                           onBlur={this.onBlurInput.bind(this, this.props.type)}/>
                                    : <Input name="input"
                                             type={this.props.type}
                                             placeholder={this.props.placeholder}
                                             value={formData.input}
                                             onChange={this.onInputChange}
                                             autoComplete="off"
                                             onFocus={this.onFocusInput.bind(this, this.props.type)}
                                             onBlur={this.onBlurInput.bind(this, this.props.type)}
                                    />}
                            </Validator>
                        </FormItem>
                    </Validation>
                    {!this.props.hideButtonBlock ? buttonBlock : null}
                </Form>
            </div>
        ) : null;

        var passwordStrengthBlock = this.props.showPasswordStrength && this.state.displayType === 'edit' && this.state.formData.input && this.state.passStrength.passBarShow ? (
            <PassStrengthBar passStrength={this.state.passStrength.passStrength}/>
        ) : null;

        return (
            <div className={displayCls}>
                {textBlock}
                {inputBlock}
                {passwordStrengthBlock}
            </div>
        );
    }
});

module.exports = BasicEditField;
