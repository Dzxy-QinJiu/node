/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/11.
 */
"use strict";

var crypto = require("crypto");
const classnames = require("classnames");
import {ssoLogin, callBackUrl, buildRefreshCaptchaUrl} from "../../lib/websso";
//常量定义
const CAPTCHA = '/captcha';
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
            //密码
            password: '',
            //验证码
            captchaCode: this.props.captcha,
            //登录按钮是否可用
            loginButtonDisabled: true,
        };
    },
    beforeSubmit: function (event) {
        //记住登录名
        var userName = $.trim(this.refs.username.value);
        if (!userName) {
            //用户名不能为空
            this.props.setErrorMsg(Intl.get("login.write.username", "请输入用户名"));
            event.preventDefault();
            return false;
        }
        localStorage.setItem("last_login_name", userName);
        //获取输入的密码
        var value = this.refs.password_input.value;
        if (!value) {
            //密码不能为空
            this.props.setErrorMsg(Intl.get("common.input.password", "请输入密码"));
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
            this.props.setErrorMsg(Intl.get("login.write.code", "请输入验证码"));
        } else {
            this.login(userName, newValue);
        }
        event.preventDefault();
        return false;
    },
    login: function (userName, password) {
        var lang = window.Oplate && window.Oplate.lang || "zh_CN";
        var captcha = this.refs.captcha_input ? this.refs.captcha_input.value : "";
        // 将登录界面中的用户名与密码提交到SSO应用中
        ssoLogin.login(userName, password, captcha).then((ticket) => {
            // 登录成功后的回调
            window.location.href = callBackUrl + "?t=" + ticket + "&lang=" + lang;
        }).catch((data) => {
            this.setState({
                captchaCode: data && data.captcha,
                loginErrorMsg: data && data.error
            });
        });
    },
    componentDidMount: function () {
        this.showUserName();
    },
    showUserName: function () {
        var userName = window.Oplate.initialProps.username || localStorage.getItem("last_login_name") || '';
        this.setState({
            username: userName,
            loginButtonDisabled: false,
        }, () => {
            if (userName) {
                this.refs.password_input.focus();
            } else {
                this.refs.username.focus();
            }
        });
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
        return (this.state.captchaCode ? (<div className="input-item captcha_wrap clearfix">
            <input placeholder={hasWindow ? Intl.get("common.captcha", "验证码") : null} type="text"
                   name="retcode" autoComplete="off"
                   tabIndex="3"
                   ref="captcha_input" maxLength="4"/>
            <img ref="captcha_img" src={ this.state.captchaCode} width="120" height="40"
                 title={Intl.get("login.dim.exchange", "看不清？点击换一张")}
                 onClick={this.refreshCaptchaCode}/>
        </div>) : null);
    },
    //获取验证码
    getLoginCaptcha: function () {
        if (this.refs.captcha_img) {
            this.refs.captcha_img.src = buildRefreshCaptchaUrl();
        }
    },
    //刷新验证码
    refreshCaptchaCode: function () {
        this.getLoginCaptcha();
    },

    render: function () {
        const loginButtonClassName = classnames("login-button", {"not-allowed": this.state.loginButtonDisabled});

        const hasWindow = this.props.hasWindow;

        return (
            <form action="/login" method="post" onSubmit={this.beforeSubmit} autoComplete="off">
                <div className="input-area">
                    <div className="input-item">
                        <input
                            placeholder={hasWindow ? Intl.get("login.username.phone.email", "用户名/手机/邮箱") : null}
                            type="text"
                            name="username" autoComplete="off" tabIndex="1"
                            ref="username" value={this.state.username} onChange={this.userNameChange}
                            onBlur={this.getLoginCaptcha}/>
                    </div>

                    <div className="input-item">
                        <input placeholder={hasWindow ? Intl.get("common.password", "密码") : null}
                               type="password" tabIndex="2"
                               ref="password_input"
                               onChange={this.passwordChange} value={this.state.password} autoComplete="off"/>
                    </div>


                    {this.renderCaptchaBlock(hasWindow)}
                </div>

                <input type="hidden" name="password" id="hidedInput" ref="password"/>

                <button className={loginButtonClassName} type={this.state.loginButtonDisabled ? "button" : "submit"}
                        tabIndex="3"
                        disabled={this.state.loginButtonDisabled }
                        data-tracename="点击登录"
                >
                    {hasWindow ? Intl.get("login.login", "登录") : null}
                </button>
            </form>
        );
    }
});

module.exports = LoginForm;
