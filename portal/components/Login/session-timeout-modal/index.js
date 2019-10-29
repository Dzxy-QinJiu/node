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
const logoScr = require('../image/wihte-logo.png');
const Logo = require('../../Logo/index');
const FormItem = Form.Item;
import userData from 'PUB_DIR/sources/user-data';
import phoneUtil from 'PUB_DIR/sources/utils/phone-util';
//错误信息提示
const ERROR_MSGS = {
    NO_SERVICE: Intl.get('login.error.retry', '登录服务暂时不可用，请稍后重试'),
    ERROR_CAPTCHA: 'error-captcha'//刷新验证码失败
};
const base64_prefix = 'data:image/png;base64,';

class SessionTimeoutModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogining: false, //正在登录
            captchaCode: '',//验证码
            loginErrorMsg: ''//登录的错误提示
        };
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
            !Oplate.hideSomeItem && require('PUB_DIR/sources/push').startSocketIo();
            const user = userData.getUserData();
            phoneUtil.initPhone(user);
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

    turnToLoginPage = () => {
        //跳转到登录页，用其他账号进行登录
        window.location.href = '/login';
    }
    //验证码\密码输入框中按enter键时，登录的处理
    onInputEnter = (event) => {
        if (event.keyCode !== 13) return;
        this.submitFormData();
    }

    render() {
        let userInfo = userData.getUserData();
        const {getFieldDecorator} = this.props.form;
        // sso登录的验证码可以直接用，普通登录时的验证码需要加上base64的头部信息
        let captchaCode = window.Oplate && window.Oplate.useSso ? this.state.captchaCode : base64_prefix + this.state.captchaCode;
        return (
            <div className="session-timeout-wrap">
                <Logo logoSrc={logoScr} size='36px' fontSize='24px'/>
                <div className="session-timeout-content">
                    <div className="user-info-logo text-align-center">
                        <Avatar
                            className="avatar"
                            size="60px"
                            fontSize='30px'
                            lineHeight="52px"
                            src={userInfo.user_logo}
                            userName={userInfo.user_name}
                            nickName={userInfo.nick_name}
                            round="true"
                            isUseDefaultUserImage={true}
                        />
                    </div>
                    <div className="user-info-name text-align-center">{userInfo.user_name}</div>
                    <div className="retry-login-tip">
                        {Intl.get('retry.no.login.for.longtime', '您已长时间没有进行操作，为了您的帐号安全，请重新登录')}
                    </div>
                    <Form autoComplete="off">
                        <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{required: true, message: Intl.get('common.input.password', '请输入密码')}]
                            })(
                                <Input type='password' placeholder={Intl.get('common.password', '密码')}
                                    onKeyUp={this.onInputEnter}
                                    autoComplete="new-password"/>
                            )}
                        </FormItem>
                        {this.state.captchaCode ? (
                            <FormItem>
                                {getFieldDecorator('retcode', {
                                    rules: [{required: true, message: Intl.get('login.write.code', '请输入验证码')}]
                                })(
                                    <Input placeholder={Intl.get('common.captcha', '验证码')} type="text"
                                        className='captcha-input'
                                        onKeyUp={this.onInputEnter}
                                        autoComplete="off" maxLength="4"/>
                                )}
                                <img src={captchaCode} width="120"
                                    height="40" className="captcha-wrap"
                                    title={Intl.get('login.dim.exchange', '看不清？点击换一张')}
                                    onClick={this.refreshCaptchaCode}/>
                            </FormItem>
                        ) : null}
                        <FormItem>
                            <Button type="primary" onClick={this.submitFormData.bind(this)}>
                                {this.state.isLogining ? <Icon type="loading"/> : null}
                                {Intl.get('login.login', '登录')}
                            </Button>
                            <div className="login-error-tip">
                                {!this.state.isLogining && this.state.loginErrorMsg ? this.state.loginErrorMsg : ''}
                            </div>
                        </FormItem>
                        <div className="login-width-other text-align-center" onClick={this.turnToLoginPage}>
                            {Intl.get('retry.login.with.other', '登录其他账号')}
                        </div>
                    </Form>
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
