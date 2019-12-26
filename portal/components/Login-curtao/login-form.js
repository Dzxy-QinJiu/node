/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/11.
 */
'use strict';

var React = require('react');
var crypto = require('crypto');
const PropTypes = require('prop-types');
import {ssoLogin, callBackUrl, buildRefreshCaptchaUrl} from '../../lib/websso';
import {Icon} from 'antd';
import classNames from 'classnames';
//常量定义
const CAPTCHA = '/captcha';
//错误信息提示
const ERROR_MSGS = {
    NO_SERVICE: Intl.get('login.error.retry', '登录服务暂时不可用，请稍后重试'),
    ERROR_CAPTCHA: 'error-captcha'//刷新验证码失败
};
var base64_prefix = 'data:image/png;base64,';
import { storageUtil } from 'ant-utils';

class LoginForm extends React.Component {
    state = {
        //用户名
        username: this.props.username,
        //密码
        password: '',
        //验证码
        captchaCode: this.props.captcha,
        //登录按钮是否可用
        loginButtonDisabled: true,
        //登录状态
        logining: false,
        //是否显示密码
        passwordVisible: false,
    };

    beforeSubmit = (event) => {
        if(this.state.logining) {
            event.preventDefault();
            return false;
        }
        var userName = _.trim(this.refs.username.value);
        if (!userName) {
            //用户名不能为空
            this.props.setErrorMsg(Intl.get('login.write.username', '请输入用户名'));
            event.preventDefault();
            return false;
        }
        //记住登录名
        storageUtil.local.set('last_login_name', userName);
        //客户分析,第一次登录的时候，默认展示全部应用
        storageUtil.local.set('customer_analysis_stored_app_id', 'all');
        //获取输入的密码
        var value = this.refs.password_input.value;
        if (!value) {
            //密码不能为空
            this.props.setErrorMsg(Intl.get('common.input.password', '请输入密码'));
            event.preventDefault();
            return false;
        }
        //需要输入验证码，但未输入验证码时
        if (this.state.captchaCode && !this.refs.captcha_input.value) {
            //验证码不能为空
            this.props.setErrorMsg(Intl.get('login.write.code', '请输入验证码'));
            //阻止缺省行为
            event.preventDefault();
            return false;
        }
        //做md5
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(value);
        var newValue = md5Hash.digest('hex');
        //设置登录状态为登录中
        this.setState({
            logining: true
        });
        if (window.Oplate && window.Oplate.useSso) {
            this.ssologin(userName, newValue);
            //阻止缺省行为
            event.preventDefault();
            return false;
        }
        //修改要提交的密码
        this.refs.password.value = newValue;
        //TODO 现在改用ajax提交方式,不用ajax方式时，请去掉下面的代码
        //阻止缺省行为,必须先写这个，不然会走form表单提交方式
        event.preventDefault();
        let submitObj = {
            username: userName,
            password: newValue
        };
        if(this.state.captchaCode && this.refs.captcha_input.value) {
            submitObj.retcode = this.refs.captcha_input.value;
        }
        this.loginFunc('/login', submitObj);
        return false;
    };

    //登录函数
    loginFunc = (url, submitObj) => {
        if(this.state.logining) {
            return false;
        }
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'post',
            data: submitObj,
            success: () => {
                window.location.href = '/';
            },
            error: (errorInfo) => {
                //在失败后，得获取下验证码
                this.getLoginCaptcha();
                this.setState({logining: false});
                this.props.setErrorMsg(errorInfo.responseJSON);
            }
        });
    };

    //sso登录
    ssologin = (userName, password) => {
        var lang = window.Oplate && window.Oplate.lang || 'zh_CN';
        var captcha = this.refs.captcha_input ? this.refs.captcha_input.value : '';
        // 将登录界面中的用户名与密码提交到SSO应用中
        ssoLogin.login(userName, password, captcha).then((ticket) => {
            // 登录成功后的回调
            sendMessage && sendMessage(userName + ' sso登录成功,ticket=' + ticket);
            window.location.href = callBackUrl + '?t=' + ticket + '&lang=' + lang;
        }).catch((data) => {
            sendMessage && sendMessage(userName + ' sso登录失败,error:' + data && data.error);
            this.props.setErrorMsg(data && data.error);
            this.setState({
                logining: false,
                captchaCode: data && data.captcha
            });
        });
    };

    componentDidMount() {
        this.showUserName();
    }

    //展示记录过的用户名，登录按钮变为可用
    showUserName = () => {
        var userName = window.Oplate.initialProps.username || storageUtil.local.get('last_login_name') || '';
        this.setState({
            username: userName,
            loginButtonDisabled: false
        }, () => {
            //如果不是用sso登录（sso登录校验时会返回验证码），并且当前没有显示验证码，则去检查显示验证码
            if (!(window.Oplate && window.Oplate.useSso) && !this.state.captchaCode) {
                this.getLoginCaptcha();
            }
            if (userName) {
                this.refs.password_input.focus();
            } else {
                this.refs.username.focus();
            }
        });
    };

    userNameChange = (evt) => {
        this.setState({
            username: evt.target.value
        }, () => this.props.setErrorMsg(''));
    };

    passwordChange = (evt) => {
        this.setState({
            password: evt.target.value
        }, () => this.props.setErrorMsg(''));
    };

    showPassword = () => {
        this.setState({
            passwordVisible: !this.state.passwordVisible 
        });
    };

    renderCaptchaBlock = (hasWindow) => {
        return (this.state.captchaCode ? (<div className="input-item captcha_wrap clearfix">
            <input placeholder={hasWindow ? Intl.get('common.captcha', '验证码') : null} type="text"
                name="retcode" autoComplete="off"
                tabIndex="3"
                ref="captcha_input" maxLength="4"/>
            <span className="login-captcha">
                {this.renderCaptchaImg(hasWindow)}
            </span>
        </div>) : null);
    };

    //展示验证码图片
    renderCaptchaImg = (hasWindow) => {
        if (hasWindow && window.Oplate && window.Oplate.useSso) {
            return (
                <img ref="captcha_img" src={ this.state.captchaCode} width="120" height="40"
                    title={Intl.get('login.dim.exchange', '看不清？点击换一张')}
                    onClick={this.refreshCaptchaCode}/> );
        } else {
            return ( <img src={base64_prefix + this.state.captchaCode} width="120"
                height="40"
                title={Intl.get('login.dim.exchange', '看不清？点击换一张')}
                onClick={this.refreshCaptchaCode}/>);
        }
    };

    //获取验证码
    getLoginCaptcha = () => {
        if (window.Oplate && window.Oplate.useSso) {
            this.getLoginCaptchaWithSso();
        } else {
            this.getLoginCaptchaWithoutSso();
        }
    };

    //刷新验证码
    refreshCaptchaCode = () => {
        if (window.Oplate && window.Oplate.useSso) {
            this.getLoginCaptchaWithSso();
        } else {
            this.refreshCaptchaCodeWithoutSso();
        }
    };

    //从sso服务器获取验证码
    getLoginCaptchaWithSso = () => {
        if (this.refs.captcha_img) {
            this.refs.captcha_img.src = buildRefreshCaptchaUrl();
        }
    };

    ///不是用sso，获取验证码
    getLoginCaptchaWithoutSso = () => {
        var username = this.state.username;
        if (!username) {
            return;
        }
        $.ajax({
            url: '/loginCaptcha',
            dataType: 'json',
            data: {
                username,
            },
            success: (data) => {
                this.setState({
                    captchaCode: data
                });
            },
            error: () => {
                this.props.setErrorMsg(ERROR_MSGS.NO_SERVICE);
            },
        });
    };

    //不是用sso，刷新验证码
    refreshCaptchaCodeWithoutSso = () => {
        var username = this.state.username;
        if (!username) {
            return;
        }
        $.ajax({
            url: '/refreshCaptcha',
            dataType: 'json',
            data: {
                username,
            },
            success: (data) => {
                this.setState({
                    captchaCode: data
                });
            },
            error: () => {
                this.setState({
                    captchaCode: ERROR_MSGS.ERROR_CAPTCHA
                });
            }
        });
    };
    openUserAgreement=(e) => {
        window.open('/user/agreement');
    }
    toRegister=(e) => {
        window.open('/register'); 
    }
    render() {
        const loginButtonClassName = classNames('login-button', {'not-allowed': this.state.loginButtonDisabled});

        const hasWindow = this.props.hasWindow;
        let displayPwd = classNames('iconfont',{'icon-password-visible': this.state.passwordVisible,
            'icon-password-invisible': !this.state.passwordVisible},);
        return (
            <form action="/login" method="post" className="login-form" onSubmit={this.beforeSubmit} autoComplete="off">
                <div className="input-area">
                    <div className="input-item">
                        <input
                            placeholder={hasWindow ? Intl.get('login.username.phone.email', '用户名/手机/邮箱') : null}
                            type="text"
                            name="username"
                            autoComplete="off" tabIndex="1"
                            ref="username" value={this.state.username} onChange={this.userNameChange}
                            onBlur={this.getLoginCaptcha}/>
                    </div>

                    <div className="input-item">
                        <input type="password" className="password-hidden-input" name="password" id="hidedInput" ref="password"/>
                        <input placeholder={hasWindow ? Intl.get('common.password', '密码') : null}
                            type={this.state.passwordVisible ? 'text' : 'password'} 
                            tabIndex="2"
                            ref="password_input"
                            logininput="password"
                            className="input-pwd"
                            onChange={this.passwordChange} value={this.state.password} autoComplete="new-password"/>
                        <i className={displayPwd} onClick={this.showPassword}></i>
                    </div>
                    {this.renderCaptchaBlock(hasWindow)}
                </div>
                <div className='login-user-agreement-tip'>
                    <ReactIntl.FormattedMessage
                        id='login.user.agreement.tip'
                        defaultMessage='点击{btn}表示您已同意我们的{userAgreement}'
                        values={{
                            'btn': Intl.get('login.login', '登录'),
                            'userAgreement': (
                                <a onClick={this.openUserAgreement} data-tracename="点击《用户协议》">
                                    {Intl.get('register.user.agreement.curtao', '《用户协议》')}
                                </a>)
                        }}
                    />
                </div>
                <button className={loginButtonClassName} type={this.state.loginButtonDisabled ? 'button' : 'submit'}
                    tabIndex="3"
                    disabled={this.state.loginButtonDisabled }
                    data-tracename="点击登录"
                >
                    {hasWindow ? Intl.get('login.login', '登录') : null}
                    {this.state.logining ? <Icon type="loading"/> : null}
                </button>
                <div className='login-no-account-register-tip'>
                    <ReactIntl.FormattedMessage
                        id='login.no.account.register.tip'
                        defaultMessage='没有账号，去{register}'
                        values={{
                            'register': (
                                <a onClick={this.toRegister} data-tracename="点击注册">
                                    {Intl.get('login.register', '注册')}
                                </a>)
                        }}
                    />
                </div>
            </form>
        );
    }
}
LoginForm.propTypes = {
    username: PropTypes.string,
    captcha: PropTypes.string,
    setErrorMsg: PropTypes.func,
    hasWindow: PropTypes.bool
};
module.exports = LoginForm;
