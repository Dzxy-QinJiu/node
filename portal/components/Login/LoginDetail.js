/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/11.
 */
"use strict";
var React = require("react");
var Logo = require("../Logo");
var crypto = require("crypto");
var QRCode = require('qrcode.react');
import Intl from "../../public/intl/intl";
import Trace from "../../lib/trace";
import _ from "underscore";

//常量定义
var CONSTANTS = {
    CAPTCHA: '/captcha'
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
            //密码
            password: '',
            //错误信息
            loginErrorMsg: this.props.loginErrorMsg,
            //验证码
            captchaCode: this.props.captchaCode,
            //登录按钮是否可用
            loginButtonDisabled: true
        };
    },
    beforeSubmit: function (event) {
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
        return (this.state.captchaCode ? (<div className="input-item captcha_wrap clearfix">
            <input placeholder={hasWindow?Intl.get("common.captcha", "验证码"):null} type="text"
                   name="retcode" autoComplete="off"
                   tabIndex="3"
                   ref="captcha_input" maxLength="4"/>
            <img src={base64_prefix + this.state.captchaCode} width="120" height="40"
                 title={Intl.get("login.dim.exchange", "看不清？点击换一张")}
                 onClick={this.refreshCaptchaCode}/>
        </div>) : null);
    },
    getErrorMsgBlock: function () {
        if (this.state.loginErrorMsg) {
            var errorImageUrl = require("./image/error.png");
            //登录错误提示样式
            var loginErrorStyle = {
                background: "no-repeat url(" + errorImageUrl + ") 0 2px",
                lineHeight: '22px',
                fontSize: '14px',
                color: '#ee5b44',
                paddingLeft: '21px',
                position: "absolute",
                top: "50%",
                left: "50%",
                margin: "58px 0 0 -140px",
            };
            //有验证码时的样式
            if (this.state.captchaCode) {
                loginErrorStyle.margin = "108px 0 0 -140px";
            }
            return (
                <div style={loginErrorStyle}>{this.state.loginErrorMsg}</div>
            );
        }
        return null;
    },
    //获取验证码
    getLoginCaptcha: function () {
        var username = this.state.username;
        if (!username) {
            return;
        }
        var _this = this;
        $.ajax({
            url: '/loginCaptcha',
            dataType: 'json',
            data: {
                username: username
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
    refreshCaptchaCode: function () {
        var username = this.state.username;
        if (!username) {
            return;
        }
        var _this = this;
        $.ajax({
            url: '/refreshCaptcha',
            dataType: 'json',
            data: {
                username: username
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
    render: function () {
        var loginButtonStyle = this.state.loginButtonDisabled ? {
            cursor: "not-allowed"
        } : {
            cursor: "pointer"
        };
        var loginWrapStyle = {
            position: "absolute",
            top: "0",
            right: "0",
            left: "0",
            bottom: "0",
        };
        var codeWrapStyle = {
            position: "absolute",
            width: "110px",
            height: "128px",
            top: "60px",
            right: "30px",
            textAlign: "center",
            background: "#fff",
        };
        var formWrapStyle = {
            position: "absolute",
            width: "280px",
            height: "200px",
            top: "50%",
            left: "50%",
            margin: "-150px 0 0 -140px",
        };
        const langWrapStyle = {
            position: "absolute",
            top: "30px",
            right: "30px",
            fontSize: "13px",
            color: "#a9b7c0"
        };
        let zhLangStyle = {
            padding: "5px",
            textDecoration: "none",
            color: "#a9b7c0"
        }, enLangStyle = _.extend({}, zhLangStyle), esLangStyle = _.extend({}, zhLangStyle);
        let hasWindow = !(typeof window === "undefined");
        if (hasWindow) {
            if (Oplate.lang == "en_US") {
                enLangStyle.backgroundColor = "#4D5B67";
            } else if (Oplate.lang == "es_VE") {
                esLangStyle.backgroundColor = "#4D5B67";
            } else {
                zhLangStyle.backgroundColor = "#4D5B67";
            }
        } else {
            zhLangStyle.backgroundColor = "#4D5B67";
        }

        return (
            <div style={loginWrapStyle}>
                { hasWindow ? (Oplate.hideLangQRcode ? null :
                    (<div>
                        <div style={langWrapStyle}>
                            <span>{Intl.get("common.user.lang", "语言")}：</span>
                            <span><a href="/login?lang=zh_CN" style={zhLangStyle}>简体中文</a></span>
                            <span><a href="/login?lang=en_US" style={enLangStyle}>English</a></span>
                            <span><a href="/login?lang=es_VE" style={esLangStyle}>Español</a></span>
                        </div>
                        <div style={codeWrapStyle}>
                            <p style={{margin:"4px 0",color:"#fc9603",fontSize:"12px"}}>
                                {Intl.get("menu.download.app", "客套APP")}
                            </p>
                            {typeof window === "undefined" ? null : (
                                <QRCode
                                    value={location.protocol + "//" + location.host + "/ketao"}
                                    level="H"
                                    size={100}
                                />
                            )}
                        </div>
                    </div>)) : null
                }
                <form action="/login" method="post" id="loginForm" onSubmit={this.beforeSubmit} autoComplete="off"
                      style={formWrapStyle}>
                    <Logo />
                    <div className="input-area">
                        <div className="input-item">
                            <input
                                placeholder={hasWindow?Intl.get("login.username.phone.email", "用户名/手机/邮箱"):null}
                                type="text"
                                name="username" autoComplete="off" tabIndex="1"
                                ref="username" value={this.state.username} onChange={this.userNameChange}
                                onBlur={this.getLoginCaptcha}/>
                        </div>
                        <div className="input-item">
                            <input placeholder={hasWindow?Intl.get("common.password", "密码"):null}
                                   type="password" tabIndex="2"
                                   ref="password_input"
                                   onChange={this.passwordChange} value={this.state.password} autoComplete="off"/>
                        </div>
                        {this.renderCaptchaBlock(hasWindow)}
                    </div>
                    <input type="hidden" name="password" id="hidedInput" ref="password"/>
                    <button style={loginButtonStyle } type={this.state.loginButtonDisabled ? "button" : "submit"}
                            tabIndex="3"
                            disabled={this.state.loginButtonDisabled }
                            data-tracename="点击登录"
                    >
                        {hasWindow ? Intl.get("login.login", "登录") : null}
                    </button>
                </form>
                {this.getErrorMsgBlock()}
            </div>
        );
    }
});

module.exports = LoginForm;