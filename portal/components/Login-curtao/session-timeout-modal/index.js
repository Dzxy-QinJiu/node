/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/4/10.
 */
import './index.less';
var crypto = require('crypto');
const PropTypes = require('prop-types');
import {ssoLogin, callBackUrl, buildRefreshCaptchaUrl} from '../../../lib/websso';
import {Form, Input, Button, Icon} from 'antd';
import Avatar from '../../Avatar/index.js';
const logoScr = require('../image/ketao-logo.svg');
const FormItem = Form.Item;
import userData from 'PUB_DIR/sources/user-data';
import ForgotPassword from '../forgot-password';
import classNames from 'classnames';
import {pcAndWechatMiniProgram} from 'PUB_DIR/sources/utils/register_util';
//错误信息提示
const ERROR_MSGS = {
    NO_SERVICE: Intl.get('login.error.retry', '登录服务暂时不可用，请稍后重试'),
    ERROR_CAPTCHA: 'error-captcha'//刷新验证码失败
};
const base64_prefix = 'data:image/png;base64,';
const VIEWS = {
    LOGIN: 'login',
    FORGOT_PASSWORD: 'forgot_password',
};
class SessionTimeoutModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogining: false, //正在登录
            captchaCode: '',//验证码
            // 当前展示的视图login：登录，forgot_password找回密码
            currentView: VIEWS.LOGIN,
            //是否显示密码
            passwordVisible: false,
            loginErrorMsg: ''//登录的错误提示
        };
    }
    componentDidMount(){
        $('.session-timeout-form .password-input').focus();
    }
    //刷新验证码
    refreshCaptchaCode = () => {
        var username = _.get(userData.getUserData(), 'user_name', '');
        if (!username) {
            return;
        }
        if (window.Oplate && window.Oplate.useSso) {
            this.setState({captchaCode: buildRefreshCaptchaUrl()});
        } else {
            $.ajax({
                url: '/refreshCaptcha',
                dataType: 'json',
                data: {
                    username,
                },
                success: (data) => {
                    this.setState({
                        captchaCode: data,
                    });
                },
                error: () => {
                    this.setState({
                        captchaCode: ERROR_MSGS.ERROR_CAPTCHA,
                    });
                }
            });
        }
    };

    submitFormData = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            const userName = _.get(userData.getUserData(), 'user_name', '');
            if (!userName) return;
            const password = _.get(values, 'password', '');
            //将密码进行md5加密
            var md5Hash = crypto.createHash('md5');
            md5Hash.update(password);
            let md5Password = md5Hash.digest('hex');
            //登录所需用户名密码
            let submitObj = {
                username: userName,
                password: md5Password,
                //验证码
                retcode: _.get(values, 'retcode', '')
            };

            this.setState({isLogining: true});
            if (window.Oplate && window.Oplate.useSso) {
                //sso登录
                this.ssoLoginFunc(submitObj);
            } else {//普通登录
                this.commonLogin(submitObj);
            }
        });
    }
    //sso登录
    ssoLoginFunc(submitObj) {
        ssoLogin.login(submitObj.username, submitObj.password, submitObj.retcode)
            .then((ticket) => {
                $.ajax({
                    url: callBackUrl + '?t=' + ticket + '&lang=' + window.Oplate.lang,
                    type: 'get',
                    success: data => {
                        this.afterLoginSuccess(submitObj.username, data);
                    },
                    error: (xhr, error) => {
                        this.afterLoginError(submitObj.username, xhr, error, true);
                    }
                });
            }).catch((data) => {
                let errorStateData = {isLogining: false};
                if (data.captcha) {//验证码
                    errorStateData.captchaCode = data.captcha;
                }
                if (data.error) {//错误提示
                    errorStateData.loginErrorMsg = data.error;
                }
                this.setState({...errorStateData});
            });
    }

    //普通的登录
    commonLogin(submitObj) {
        $.ajax({
            url: '/login',
            dataType: 'json',
            type: 'post',
            data: submitObj,
            success: data => {
                this.afterLoginSuccess(submitObj.username, data);
            },
            error: (xhr, error) => {
                this.afterLoginError(submitObj.username, xhr, error);
            }
        });
    }

    //登录成功处理
    afterLoginSuccess(username, data) {
        sendMessage && sendMessage(username + ' 登录成功 data: ' + JSON.stringify(data));
        userData.getUserDataByAjax().done(() => {
            //重新建立socket连接
            !Oplate.hideSomeItem && require('PUB_DIR/sources/push').startSocketIo(true);
            this.setState({isLogining: false, captchaCode: '', loginErrorMsg: ''});
            var $modal = $('body >#session-timeout-modal');
            if ($modal && $modal.length > 0) {
                $modal.remove();
            }
        });
    }

    //登录失败处理
    afterLoginError(username, xhr, error, isSSoLogin) {
        let errorMsg = xhr && xhr.responseJSON || error;
        sendMessage && sendMessage(username + ' 登录失败，error: ' + errorMsg);
        if (errorMsg === Intl.get('errorcode.39', '用户名或密码错误') || !errorMsg) {
            errorMsg = Intl.get('login.password.error', '密码错误');
        }
        if (isSSoLogin) {
            this.setState({loginErrorMsg: errorMsg, isLogining: false});
        } else {
            //获取验证码
            this.getLoginCaptcha(username, errorMsg);
        }
    }

    //获取验证码
    getLoginCaptcha(username, errorMsg) {
        if (window.Oplate && window.Oplate.useSso) {
            this.setState({captchaCode: buildRefreshCaptchaUrl(), isLogining: false, loginErrorMsg: errorMsg});
        } else {
            $.ajax({
                url: '/loginCaptcha',
                dataType: 'json',
                data: {
                    username: username
                },
                success: data => {
                    this.setState({captchaCode: data || '', isLogining: false, loginErrorMsg: errorMsg});
                },
                error: () => {
                    sendMessage && sendMessage(username + ',获取验证码错误');
                    this.setState({isLogining: false, captchaCode: ERROR_MSGS.ERROR_CAPTCHA, loginErrorMsg: errorMsg});
                }
            });
        }
    }

    // 监听密码输入框变化
    monitorInputChange = () => {
        this.setState({loginErrorMsg: ''});
    }

    turnToLoginPage = () => {
        //跳转到登录页，用其他账号进行登录
        pcAndWechatMiniProgram('/login');
    }
    //验证码\密码输入框中按enter键时，登录的处理
    onInputEnter = (event) => {
        if (event.keyCode !== 13) return;
        this.submitFormData();
    }
    changeView(view) {
        this.setState({currentView: view, loginErrorMsg: ''});
    }
    showPassword = () => {
        this.setState({
            passwordVisible: !this.state.passwordVisible
        });
    };
    renderLoginWrap(userInfo) {
        const {getFieldDecorator} = this.props.form;
        // sso登录的验证码可以直接用，普通登录时的验证码需要加上base64的头部信息
        let captchaCode = window.Oplate && window.Oplate.useSso ? this.state.captchaCode : base64_prefix + this.state.captchaCode;
        let displayPwd = classNames('iconfont',{'icon-password-visible': this.state.passwordVisible,
            'icon-password-invisible': !this.state.passwordVisible},);
        let user_name = _.get(userInfo, 'user_name', '');
        let nameLength = _.get(user_name, 'length', 0);
        // 截取前1位
        let start_str = user_name.substr(0, 1) + '***';
        // 名字长度如果大于2位，中间显示1***3
        if (nameLength > 2) {
            // 截取后1位
            let end_str = user_name.substr(nameLength - 1);
            user_name = start_str + end_str;
        } else {//1或2位时显示1***
            user_name = start_str;
        }
        return (
            <React.Fragment>
                <div className="user-info-name text-align-center">{user_name}</div>
                <div className="retry-login-tip">
                    {Intl.get('retry.no.login.for.longtime', '您已长时间没有进行操作，为了您的帐号安全，请重新登录')}
                </div>
                <Form autoComplete="off" className='session-timeout-form'>
                    <FormItem>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: Intl.get('common.input.password', '请输入密码') }]
                        })(
                            <Input type={this.state.passwordVisible ? 'text' : 'password'} onChange={this.monitorInputChange} className='password-input' placeholder={Intl.get('common.password', '密码')}
                                onKeyUp={this.onInputEnter}
                                autoComplete="new-password" />
                        )}
                        <i className={displayPwd} onClick={this.showPassword}></i>
                    </FormItem>
                    {this.state.captchaCode ? (
                        <FormItem>
                            {getFieldDecorator('retcode', {
                                rules: [{ required: true, message: Intl.get('login.write.code', '请输入验证码') }]
                            })(
                                <Input placeholder={Intl.get('common.captcha', '验证码')} type="text"
                                    className='captcha-input'
                                    onKeyUp={this.onInputEnter}
                                    autoComplete="off" maxLength="4" />
                            )}
                            <img src={captchaCode} width="120"
                                height="40" className="captcha-wrap"
                                title={Intl.get('login.dim.exchange', '看不清？点击换一张')}
                                onClick={this.refreshCaptchaCode} />
                        </FormItem>
                    ) : null}
                    <FormItem>
                        <Button type="primary" onClick={this.submitFormData.bind(this)}>
                            {this.state.isLogining ? <Icon type="loading" /> : null}
                            {Intl.get('login.login', '登录')}
                        </Button>
                        {!this.state.isLogining && this.state.loginErrorMsg ? (
                            <div className="login-error-tip">
                                {this.state.loginErrorMsg}
                            </div>
                        ) : null}
                        <div>
                            <a className='login-find-password-tip' data-tracename="点击忘记密码" onClick={this.changeView.bind(this, VIEWS.FORGOT_PASSWORD)}>
                                {Intl.get('login.forgot_password', '忘记密码')}
                            </a>
                            <span className='login-width-other text-align-center' onClick={this.turnToLoginPage} data-tracename="登录其他账号">
                                {Intl.get('retry.login.with.other', '登录其他账号')}
                            </span>
                        </div>
                    </FormItem>
                </Form>
            </React.Fragment>);
    }
    render() {
        let userInfo = userData.getUserData();
        return (
            <div className="session-timeout-wrap">
                <div className="session-timeout-content">
                    <div className="user-info-logo text-align-center">
                        <Avatar
                            className="avatar"
                            size="64px"
                            fontSize='32px'
                            lineHeight="64px"
                            src={userInfo.user_logo}
                            userName={userInfo.user_name}
                            nickName={userInfo.nick_name}
                            round="true"
                        />
                    </div>
                    {this.state.currentView === VIEWS.LOGIN ? this.renderLoginWrap(userInfo) : (
                        <ForgotPassword
                            hasWindow={true}
                            views={VIEWS}
                            userName={this.state.userName}
                            changeView={this.changeView.bind(this, VIEWS.LOGIN)}
                            {...this.props}
                        />)}
                </div>
                <img className='logo' src={logoScr}/>
                <div className='footer'>
                    <span>
                        {Intl.get('company.name.curtao', '© 客套智能科技 鲁ICP备18038856号')}
                    </span>
                    <span>
                        {Intl.get('companay.hotline', '服务热线: {phone}', { phone: '400-6978-520' })}
                    </span>
                </div>
            </div>
        );
    }
}

SessionTimeoutModal.propTypes = {
    username: PropTypes.string,
    captcha: PropTypes.string,
    setErrorMsg: PropTypes.func,
    hasWindow: PropTypes.bool,
    isBindWechat: PropTypes.bool,
    form: PropTypes.object
};
module.exports = Form.create()(SessionTimeoutModal);
