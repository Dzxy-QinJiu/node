/**
 * input(输入框)显示、编辑 的组件
 * 可切换状态
 */
import {Form, Input, Validation, Icon} from "antd";
var crypto = require("crypto");
var classNames = require("classnames");
var secretPassword = "";
var FormItem = Form.Item;
var Validator = Validation.Validator;
import FieldMixin from "../antd-form-fieldmixin/index";
var PasswordStrengthBar = require("../password-strength-bar/index").PassStrengthBar;
var getPassStrenth = require("../password-strength-bar/index").getPassStrenth;
var autosize = require("autosize");
import Trace from "LIB_DIR/trace";
require("./css/basic-edit-field.scss");

var UserBasicEditField = React.createClass({
    mixins: [FieldMixin],
    getDefaultProps: function () {
        return {
            user_id: '1',
            //类型 text或password
            type: 'text',
            //字段
            field: "email",
            //是否能修改
            disabled: false,
            //验证条件
            validators: [{}],
            //请填写
            placeholder: Intl.get("user.email.write.tip", "请填写邮箱"),
            //显示的值
            value: '',
            //提示文案
            title: Intl.get("common.update", "修改"),
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
        if (nextProps.user_id !== this.props.user_id) {
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
            var dom = $('input[type="text"],input[type="password"],textarea', this.refs.inputWrap)[1];
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
            if (this.props.type === 'textarea') {
                autosize($(this.refs.inputWrap).find("textarea")[0]);
            }
        });
        this.props.onDisplayTypeChange("edit");
        Trace.traceEvent(e,"点击编辑"+this.props.field);
    },
    md5: function (value) {
        var md5Hash = crypto.createHash("md5");
        md5Hash.update(value);
        return md5Hash.digest("hex");
    },
    handleSubmit: function (e) {
        var validation = this.refs.validation;
        var _this = this;
        Trace.traceEvent(e,"保存对"+this.props.field+"的修改");
        validation.validate(function (valid) {
            if (!valid) {
                return;
            }
            var value = _this.state.formData.input;
            var user = {
                user_id: _this.props.user_id
            };
            if (_this.props.type === 'password') {
                user[_this.props.field] = _this.md5(value);
            } else {
                user[_this.props.field] = value;
            }
            _this.setState({
                loading: true
            });

            function setDisplayState() {
                _this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: _this.props.type === 'password' ? secretPassword : value,
                    displayType: 'text'
                });
            }

            if ((_this.props.type === 'password' && value != secretPassword)
                || (value != _this.state.value)) {
                _this.props.saveEditInput(user).then(function (result) {
                    if (result) {
                        setDisplayState();
                        _this.props.modifySuccess(user);
                    } else {
                        _this.setState({
                            loading: false,
                            submitErrorMsg: Intl.get("common.edit.failed", "修改失败")
                        });
                    }
                }, function (errorMsg) {
                    _this.setState({
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
        Trace.traceEvent(e,"取消对"+this.props.field+"的修改");
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
        if (this.props.type === 'password' && this.state.formData.input) {
            var passStrength = getPassStrenth(e.target.value);
            this.setState({
                passStrength: passStrength
            });
        }
        this.setField.bind(this, 'input', e);
        this.props.onValueChange();
    },
    render: function () {
        var formData = this.state.formData;
        var status = this.state.status;
        var displayCls = classNames({
            'user-basic-edit-field-input': this.props.type !== 'textarea',
            'user-basic-edit-field-textarea': this.props.type === 'textarea',
            'user-basic-edit-field': true,
            'editing': this.state.displayType === 'edit'
        });

        var displayText = this.props.type === 'password' ? Intl.get("user.password.tip", "保密中") : this.state.value;

        var textBlock = this.state.displayType === 'text' ? (
            <div>
                <span
                    className="inline-block">{displayText}{this.props.afterValTip ? this.props.afterValTip : ""}</span>
                {
                    !this.props.disabled ? (
                        <i className="inline-block iconfont icon-update" title={this.props.title}
                           onClick={(e)=>{this.setEditable(e)}}></i>
                    ) : null
                }

            </div>
        ) : null;

        var errorBlock = this.state.submitErrorMsg ? (
            <div className="has-error"><span className="ant-form-explain">{this.state.submitErrorMsg}</span></div>
        ) : null;

        var buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : (
            <div>
                <i title={Intl.get("common.update", "修改")} className="inline-block iconfont icon-choose"
                   onClick={(e)=>{this.handleSubmit(e)}}></i>
                <i title={Intl.get("common.cancel", "取消")} className="inline-block iconfont icon-close"
                   onClick={(e)=>{this.handleCancel(e)}}></i>
            </div>
        );


        var inputBlock = this.state.displayType === 'edit' ? (
            <div className="inputWrap" ref="inputWrap">
                <Form horizontal autoComplete="off">
                    <input type="password" style={{display:"none"}} name="input" autoComplete="off"/>
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            label=""
                            labelCol={{span: 0}}
                            wrapperCol={{span: 24}}
                            validateStatus={this.renderValidateStyle('input')}
                            help={status.input.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.input.errors && status.input.errors.join(','))}
                        >
                            <Validator rules={this.props.validators}>
                                <Input name="input"
                                       rows={this.props.type === 'textarea' ? this.props.rows : null}
                                       type={this.props.type}
                                       maxLength={this.props.type==='password'?18:''}
                                       placeholder={this.props.placeholder}
                                       value={formData.input}
                                       onChange={this.onInputChange}
                                       autoComplete="off"
                                       onFocus={this.onFocusInput.bind(this , this.props.type)}
                                       onBlur={this.onBlurInput.bind(this,this.props.type)}
                                />
                            </Validator>
                        </FormItem>
                    </Validation>
                    <div className="buttons">
                        {!this.props.hideButtonBlock ? buttonBlock : null}
                    </div>
                </Form>
                {errorBlock}
            </div>
        ) : null;

        var passwordStrengthBlock = this.props.showPasswordStrength && this.state.displayType === 'edit' && this.state.formData.input && this.state.passStrength.passBarShow ? (
            <PasswordStrengthBar passStrength={this.state.passStrength.passStrength}/>
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

module.exports = UserBasicEditField;