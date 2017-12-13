/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/11.
 */
"use strict";

import { isPhone, isEmail } from "../../lib/func";
var crypto = require("crypto");
const classnames = require("classnames");
import { Steps } from "antd";
const Step = Steps.Step;

//常量定义
const CAPTCHA = '/captcha';
const VIEWS = {
    LOGIN: "login",
    SEND_AUTH_CODE: "send_auth_code",
    VERIFY_AUTH_CODE: "verify_auth_code",
    RESET_PASSWORD: "reset_password",
    DONE: "done",
};
//错误信息提示
const ERROR_MSGS = {
    NO_SERVICE: Intl.get("login.error.retry", "登录服务暂时不可用，请稍后重试"),
    ERROR_CAPTCHA: "error-captcha"//刷新验证码失败
};
var base64_prefix = "data:image/png;base64,";

var LoginForm = React.createClass({
    getInitialState: function () {
        return {
            //用户名
            username: this.props.username,
            //用户Id
            userId: "",
            //密码
            password: '',
            //新密码
            newPassword: '',
            //错误信息
            loginErrorMsg: this.props.loginErrorMsg,
            //成功信息
            successMsg: "",
            //验证码
            captchaCode: this.props.captchaCode,
            //验证码值
            captchaCodeValue: "",
            //登录按钮是否可用
            loginButtonDisabled: true,
            //当前视图
            currentView: VIEWS.LOGIN,
            //当前步骤
            step: 0,
            //联系方式信息
            contactInfo: "",
            //联系方式类型
            contactType: "",
            //联系方式类型名称
            contactTypeName: "",
            //凭证
            ticket: "",
        };
    },
    beforeSubmit: function (event) {
        //只有在登录界面时需要支持表单提交
        if (this.state.currentView !== VIEWS.LOGIN) {
            event.preventDefault();
            return false;
        }

        //记住登录名
        var userName = $.trim(this.refs.username.value);
        if (!userName) {
            //用户名不能为空
            this.setState({loginErrorMsg: Intl.get("login.write.username", "请输入用户名")});
            event.preventDefault();
            return false;
        }
        localStorage.setItem("last_login_name", userName);
        //获取输入的密码
        var value = this.refs.password_input.value;
        if (!value) {
            //密码不能为空
            this.setState({loginErrorMsg: Intl.get("common.input.password", "请输入密码")});
            event.preventDefault();
            return false;
        }
        //做md5
        var md5Hash = crypto.createHash("md5");
        md5Hash.update(value);
        var newValue = md5Hash.digest('hex');
        //添加到网络请求里
        this.refs.password.value = newValue;
        //需要输入验证码，但未输入验证码时
        if (this.state.captchaCode && !this.refs.captcha_input.value) {
            //验证码不能为空
            this.setState({loginErrorMsg: Intl.get("login.write.code", "请输入验证码")});
            event.preventDefault();
            return false;
        }
    },
    componentDidMount: function () {
        var userName = window.Oplate.initialProps.username || localStorage.getItem("last_login_name") || '';
        var _this = this;
        this.setState({
            username: userName,
            loginButtonDisabled: false
        }, function () {
            //如果当前没有显示验证码，则去检查显示验证码
            if (!_this.state.captchaCode) {
                _this.getLoginCaptcha();
            }
        });
        if (userName) {
            this.refs.password_input.focus();
        } else {
            this.refs.username.focus();
        }
        Trace.addEventListener(window, "click", Trace.eventHandler);
    },
    componentWillUnmount: function () {
        Trace.detachEventListener(window, "click", Trace.eventHandler);
    },
    userNameChange: function (evt) {
        this.setState({
            username: evt.target.value
        });
    },
    passwordChange: function (evt) {
        this.setState({
            password: evt.target.value
        });
    },
    renderCaptchaBlock: function (hasWindow) {
        const type = this.state.currentView === VIEWS.SEND_AUTH_CODE? VIEWS.RESET_PASSWORD : "";

        return (this.state.captchaCode ? (<div className="input-item captcha_wrap clearfix">
            <input placeholder={hasWindow?Intl.get("common.captcha", "验证码"):null} type="text"
                   name="retcode" autoComplete="off"
                   tabIndex="3"
                   onChange={this.handleCaptchaCodeValueChange}
                   ref="captcha_input" maxLength="4"/>
            <img src={base64_prefix + this.state.captchaCode} width="120" height="40"
                 title={Intl.get("login.dim.exchange", "看不清？点击换一张")}
                 onClick={this.refreshCaptchaCode.bind(this, type)}/>
        </div>) : null);
    },
    getErrorMsgBlock: function () {
        if (this.state.loginErrorMsg) {
            var errorImageUrl = require("./image/error.png");
            //登录错误提示样式
            var loginErrorStyle = {
                background: "no-repeat url(" + errorImageUrl + ") 0 2px",
                lineHeight: '22px',
                color: '#ee5b44',
                paddingLeft: '21px',
                marginTop: "8px",
            };

            return (
                <div className="login-error">{this.state.loginErrorMsg}</div>
            );
        }
        return null;
    },
    //渲染成功提示信息
    getSuccessMsgBlock() {
        const msg = this.state.successMsg;

        return msg? (
            <div className="success-msg">
                {msg}
            </div>
        ) : null;
    },
    //获取验证码
    getLoginCaptcha: function (type = "") {
        var username = this.state.username;
        if (!username) {
            return;
        }
        var _this = this;
        $.ajax({
            url: '/loginCaptcha',
            dataType: 'json',
            data: {
                username,
                type,
            },
            success: function (data) {
                _this.setState({
                    captchaCode: data
                });
            },
            error: function () {
                _this.setState({
                    loginErrorMsg: ERROR_MSGS.NO_SERVICE
                });
            }
        });
    },
    //刷新验证码
    refreshCaptchaCode: function (type = "") {
        var username = this.state.username;
        if (!username) {
            return;
        }
        var _this = this;
        $.ajax({
            url: '/refreshCaptcha',
            dataType: 'json',
            data: {
                username,
                type,
            },
            success: function (data) {
                _this.setState({
                    captchaCode: data
                });
            },
            error: function () {
                _this.setState({
                    captchaCode: ERROR_MSGS.ERROR_CAPTCHA
                });
            }
        });
    },

    changeView(view) {
        const views = [
            VIEWS.SEND_AUTH_CODE,
            VIEWS.VERIFY_AUTH_CODE,
            VIEWS.RESET_PASSWORD,
            VIEWS.DONE,
        ];

        const viewIndex = views.indexOf(view);

        const step = viewIndex > -1? viewIndex : 0;

        this.setState({ currentView: view, step, captchaCode: "", loginErrorMsg: "", successMsg: "" }, () => {
            const firstInput = $("input")[0];
            if (firstInput && view !== VIEWS.LOGIN) firstInput.focus();
        });

        if (view === VIEWS.SEND_AUTH_CODE) {
            this.getLoginCaptcha(VIEWS.RESET_PASSWORD);
        }
    },

    handleContactInfoChange(e) {
        let contactInfo = e.target.value.trim();
        this.setState({ contactInfo, loginErrorMsg: "" });
    },

    handleCaptchaCodeValueChange(e) {
        let captchaCodeValue = e.target.value.trim();
        this.setState({ captchaCodeValue, loginErrorMsg: "" });
    },

    handleAuthCodeChange(e) {
        let authCode = e.target.value.trim();
        this.setState({ authCode });
    },

    handleNewPasswordChange(e) {
        let newPassword = e.target.value.trim();
        this.setState({ newPassword });
    },

    checkContactInfo(callback) {
        let contactInfo = this.state.contactInfo;
        let contactType = "";
        let contactTypeName = "";

        if (!contactInfo) {
            this.setState({loginErrorMsg: Intl.get("login.please_input_phone_or_email", "请输入手机号或邮箱")});
            return;
        } else if (isPhone(contactInfo)) {
            contactType = "phone";
            contactTypeName = Intl.get("common.phone", "手机");
        } else if (isEmail(contactInfo)) {
            contactType = "email";
            contactTypeName = Intl.get("common.email", "邮箱");
        } else {
            this.setState({loginErrorMsg: Intl.get("login.incorrect_phone_or_email", "手机号或邮箱格式不正确")});
            return;
        }

        this.setState({ contactType, contactTypeName });

        $.ajax({
            url: '/check_contact_info_exists',
            dataType: 'json',
            data: {
                contactType,
                contactInfo,
            },
            success: (data) => {
                if (!data) {
                    this.setState({loginErrorMsg: Intl.get("login.no_account_of_phone_or_email", "系统中没有该{contactTypeName}对应的帐号", {contactTypeName})});
                } else {
                    const username = data.user_name;
                    const userId = data.user_id;

                    if (username) {
                        this.setState({ username, userId });
                        callback();
                    }
                }
            },
            error: () => {
                this.setState({loginErrorMsg: Intl.get("login.check_contact_info_failure", "联系方式检查失败")});
            }
        });
    },

    sendMsg() {
        this.checkContactInfo(() => {
            const captcha = this.state.captchaCodeValue;
            const user_name = this.state.username;
            const send_type = this.state.contactType;
    
            if (!captcha) {
                this.setState({loginErrorMsg: Intl.get("retry.input.captcha", "请输入验证码")});
                return;
            }
    
            $.ajax({
                url: '/send_reset_password_msg',
                dataType: 'json',
                data: {
                    user_name,
                    captcha,
                    send_type,
                },
                success: (data) => {
                    if (!data) {
                        this.setState({loginErrorMsg: Intl.get("login.message_sent_failure", "信息发送失败")});
                    } else {
                        this.changeView(VIEWS.VERIFY_AUTH_CODE);
                        this.setState({successMsg: Intl.get("login.message_has_been_send", "信息已发送")});
                    }
                },
                error: (errorObj) => {
                    const errorMsg = errorObj && errorObj.responseJSON && errorObj.responseJSON.message;

                    if (errorMsg) {
                        this.setState({loginErrorMsg: errorMsg});
                    }
                }
            });
        });
    },

    getTicket() {
        const code = this.state.authCode;
        const user_id = this.state.userId;

        if (!code) {
            return;
        }

        $.ajax({
            url: '/get_reset_password_ticket',
            dataType: 'json',
            data: {
                user_id,
                code,
            },
            success: (data) => {
                if (!data) {
                    this.setState({loginErrorMsg: Intl.get("login.authentication_failure", "身份验证失败")});
                } else {
                    this.setState({ticket: data.ticket});
                    this.changeView(VIEWS.RESET_PASSWORD);
                }
            },
            error: () => {
                this.setState({loginErrorMsg: Intl.get("login.authentication_failure", "身份验证失败")});
            }
        });
    },

    resetPassword() {
        const ticket = this.state.ticket;
        const user_id = this.state.userId;
        let new_password = this.state.newPassword;
        //做md5
        var md5Hash = crypto.createHash("md5");
        md5Hash.update(new_password);
        new_password = md5Hash.digest('hex');

        if (!new_password) {
            return;
        }

        $.ajax({
            url: '/reset_password_with_ticket',
            dataType: 'json',
            data: {
                user_id,
                ticket,
                new_password,
            },
            success: (data) => {
                if (!data) {
                    this.changeView(VIEWS.DONE);
                    this.setState({successMsg: Intl.get("login.reset_password_success", "重置密码成功，请返回登录页用新密码登录")});
                } else {
                    this.setState({loginErrorMsg: Intl.get("login.reset_password_failure", "重置密码失败")});
                }
            },
            error: () => {
                this.setState({loginErrorMsg: Intl.get("login.reset_password_failure", "重置密码失败")});
            }
        });
    },

    render: function () {
        const loginButtonClassName = classnames("login-button", {"not-allowed": this.state.loginButtonDisabled});

        const hasWindow = this.props.hasWindow;

        return (
            <form action="/login" method="post" id="loginForm" onSubmit={this.beforeSubmit} autoComplete="off">
                {this.state.currentView !== VIEWS.LOGIN? (
                <Steps current={this.state.step}>
                    <Step title={Intl.get("login.fill_in_contact_info", "填写联系信息")} />
                    <Step title={Intl.get("login.verify_identity", "验证身份")} />
                    <Step title={Intl.get("login.set_new_password", "设置新密码")} />
                    <Step title={Intl.get("user.user.add.finish", "完成")} />
                </Steps>
                ) : null}

                {this.getSuccessMsgBlock()}

                <div className="input-area">
                    {this.state.currentView === VIEWS.LOGIN? (
                    <div className="input-item">
                        <input
                            placeholder={hasWindow?Intl.get("login.username.phone.email", "用户名/手机/邮箱"):null}
                            type="text"
                            name="username" autoComplete="off" tabIndex="1"
                            ref="username" value={this.state.username} onChange={this.userNameChange}
                            onBlur={this.getLoginCaptcha}/>
                    </div>
                    ) : null}

                    {this.state.currentView === VIEWS.LOGIN? (
                    <div className="input-item">
                        <input placeholder={hasWindow?Intl.get("common.password", "密码"):null}
                               type="password" tabIndex="2"
                               ref="password_input"
                               onChange={this.passwordChange} value={this.state.password} autoComplete="off"/>
                    </div>
                    ) : null}

                    {this.state.currentView === VIEWS.SEND_AUTH_CODE? (
                    <div className="input-item">
                        <input tabIndex="1"  placeholder={Intl.get("login.please_input_phone_or_email", "请输入手机号或邮箱")} onChange={this.handleContactInfoChange.bind(this)} />
                    </div>
                    ) : null}

                    {this.state.currentView === VIEWS.VERIFY_AUTH_CODE? (
                    <div className="input-item">
                        <input tabIndex="1"  placeholder={Intl.get("login.please_enter_contact_type_verification_code", "请输入{contactTypeName}验证码", {contactTypeName: this.state.contactTypeName})} onChange={this.handleAuthCodeChange} />
                    </div>
                    ) : null}

                    {this.state.currentView === VIEWS.RESET_PASSWORD? (
                    <div className="input-item">
                        <input tabIndex="1"  type="password" placeholder={Intl.get("login.please_enter_new_password", "请输入新密码")} onChange={this.handleNewPasswordChange} />
                    </div>
                    ) : null}

                    {this.renderCaptchaBlock(hasWindow)}
                </div>

                {this.state.currentView === VIEWS.LOGIN? (
                <input type="hidden" name="password" id="hidedInput" ref="password"/>
                ) : null}

                {this.state.currentView === VIEWS.LOGIN? (
                <button className={loginButtonClassName} type={this.state.loginButtonDisabled ? "button" : "submit"}
                        tabIndex="3"
                        disabled={this.state.loginButtonDisabled }
                        data-tracename="点击登录"
                >
                    {hasWindow ? Intl.get("login.login", "登录") : null}
                </button>
                ) : null}

                {this.state.currentView === VIEWS.SEND_AUTH_CODE? (
                <button className="login-button" type="button"
                        tabIndex="3"
                        onClick={this.sendMsg}
                        data-tracename="点击发送手机/邮箱验证码按钮"
                >
                    {hasWindow ? Intl.get("login.send_phone_or_email_verification_code", "发送手机/邮箱验证码") : null}
                </button>
                ) : null}

                {this.state.currentView === VIEWS.VERIFY_AUTH_CODE? (
                <button className="login-button" type="button"
                        tabIndex="3"
                        onClick={this.getTicket}
                        data-tracename={"点击验证" + this.state.contactTypeName + "验证码按钮"}
                >
                    {hasWindow ? Intl.get("login.verify_phone_or_email_verification_code", "验证{contactTypeName}验证码", {contactTypeName: this.state.contactTypeName}) : null}
                </button>
                ) : null}

                {this.state.currentView === VIEWS.RESET_PASSWORD? (
                <button className="login-button" type="button"
                        tabIndex="3"
                        onClick={this.resetPassword}
                        data-tracename="点击重置密码按钮"
                >
                    {hasWindow ? Intl.get("user.batch.password.reset", "重置密码") : null}
                </button>
                ) : null}

                {this.state.currentView === VIEWS.DONE? (
                <div tabIndex="1"></div>
                ) : null}

                {this.state.currentView === VIEWS.LOGIN? (
                <div tabIndex="5" onClick={this.changeView.bind(this, VIEWS.SEND_AUTH_CODE)} onKeyPress={this.changeView.bind(this, VIEWS.SEND_AUTH_CODE)} className="btn-change-view">{Intl.get("login.forgot_password", "忘记密码")}</div>
                ) : null}

                {this.state.currentView !== VIEWS.LOGIN? (
                <div tabIndex="5" onClick={this.changeView.bind(this, VIEWS.LOGIN)} onKeyPress={this.changeView.bind(this, VIEWS.LOGIN)} className="btn-change-view">{Intl.get("login.return_to_login_page", "返回登录页")}</div>
                ) : null}

                {this.getErrorMsgBlock()}
            </form>
        );
    }
});

module.exports = LoginForm;
