/**
 * 找回密码
 */

var React = require('react');
import {isPhone, isEmail} from 'PUB_DIR/sources/utils/validate-util';
var crypto = require('crypto');
import { Steps } from 'antd';
const Step = Steps.Step;

//常量定义
const CAPTCHA = '/captcha';
const VIEWS = {
    SEND_AUTH_CODE: 'send_auth_code',
    VERIFY_AUTH_CODE: 'verify_auth_code',
    RESET_PASSWORD: 'reset_password',
    DONE: 'done',
};
//错误信息提示
const ERROR_MSGS = {
    NO_SERVICE: Intl.get('login.error.retry', '登录服务暂时不可用，请稍后重试'),
    ERROR_CAPTCHA: 'error-captcha'//刷新验证码失败
};
var base64_prefix = 'data:image/png;base64,';
import { storageUtil } from 'ant-utils';

class ForgotPassword extends React.Component {
    state = {
        //用户名
        username: this.props.username,
        //用户Id
        userId: '',
        //密码
        password: '',
        //新密码
        newPassword: '',
        //成功信息
        successMsg: '',
        //验证码
        captchaCode: this.props.captchaCode,
        //验证码值
        captchaCodeValue: '',
        //当前视图
        currentView: VIEWS.SEND_AUTH_CODE,
        //当前步骤
        step: 0,
        //联系方式信息
        contactInfo: '',
        //联系方式类型
        contactType: '',
        //联系方式类型名称
        contactTypeName: '',
        //凭证
        ticket: '',
    };

    componentDidMount() {
        var userName = window.Oplate.initialProps.username || storageUtil.local.get('last_login_name') || '';

        this.setState({
            username: userName,
            loginButtonDisabled: false
        }, () => {
            //如果当前没有显示验证码，则去检查显示验证码
            if (!this.state.captchaCode) {
                this.getLoginCaptcha(VIEWS.RESET_PASSWORD);
            }
        });
    }

    renderCaptchaBlock = (hasWindow) => {
        const type = this.state.currentView === VIEWS.SEND_AUTH_CODE ? VIEWS.RESET_PASSWORD : '';

        return (this.state.captchaCode ? (<div className="input-item captcha_wrap clearfix">
            <input placeholder={hasWindow ? Intl.get('common.captcha', '验证码') : null} type="text"
                name="retcode" autoComplete="off"
                tabIndex="3"
                onChange={this.handleCaptchaCodeValueChange}
                ref="captcha_input" maxLength="4"/>
            <img src={base64_prefix + this.state.captchaCode} width="120" height="40"
                title={Intl.get('login.dim.exchange', '看不清？点击换一张')}
                onClick={this.refreshCaptchaCode.bind(this, type)}/>
        </div>) : null);
    };

    //渲染成功提示信息
    getSuccessMsgBlock = () => {
        const msg = this.state.successMsg;

        return msg ? (
            <div className="success-msg">
                {msg}
            </div>
        ) : null;
    };

    //获取验证码
    getLoginCaptcha = (type = '') => {
        var username = this.state.username;
        if (!username) {
            return;
        }

        $.ajax({
            url: '/loginCaptcha',
            dataType: 'json',
            data: {
                username,
                type,
            },
            success: (data) => {
                this.setState({
                    captchaCode: data
                });
            },
            error: () => {
                this.props.setErrorMsg(ERROR_MSGS.NO_SERVICE);
            }
        });
    };

    //刷新验证码
    refreshCaptchaCode = (type = '') => {
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
            success: function(data) {
                _this.setState({
                    captchaCode: data
                });
            },
            error: function() {
                _this.setState({
                    captchaCode: ERROR_MSGS.ERROR_CAPTCHA
                });
            }
        });
    };

    changeView = (view) => {
        const views = [
            VIEWS.SEND_AUTH_CODE,
            VIEWS.VERIFY_AUTH_CODE,
            VIEWS.RESET_PASSWORD,
            VIEWS.DONE,
        ];

        const viewIndex = views.indexOf(view);

        const step = viewIndex > -1 ? viewIndex : 0;

        this.props.setErrorMsg('');

        this.setState({ currentView: view, step, captchaCode: '', successMsg: '' }, () => {
            const firstInput = $('input')[0];
            if (firstInput) firstInput.focus();
        });

        if (view === VIEWS.SEND_AUTH_CODE) {
            this.getLoginCaptcha(VIEWS.RESET_PASSWORD);
        }
    };

    handleContactInfoChange = (e) => {
        let contactInfo = _.trim(e.target.value);
        this.setState({ contactInfo });
        this.props.setErrorMsg('');

    };

    handleCaptchaCodeValueChange = (e) => {
        let captchaCodeValue = _.trim(e.target.value);
        this.setState({ captchaCodeValue });
        this.props.setErrorMsg('');

    };

    handleAuthCodeChange = (e) => {
        let authCode = _.trim(e.target.value);
        this.setState({ authCode });
    };

    handleNewPasswordChange = (e) => {
        let newPassword = _.trim(e.target.value);
        this.setState({ newPassword });
    };

    checkContactInfo = (callback) => {
        let contactInfo = this.state.contactInfo;
        let contactType = '';
        let contactTypeName = '';

        if (!contactInfo) {
            this.props.setErrorMsg(Intl.get('login.please_input_phone_or_email', '请输入手机号或邮箱'));
            return;
        } else if (isPhone(contactInfo)) {
            contactType = 'phone';
            contactTypeName = Intl.get('common.phone', '手机');
        } else if (isEmail(contactInfo)) {
            contactType = 'email';
            contactTypeName = Intl.get('common.email', '邮箱');
        } else {
            this.props.setErrorMsg(Intl.get('login.incorrect_phone_or_email', '手机号或邮箱格式不正确'));
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
                    this.props.setErrorMsg(Intl.get('login.no_account_of_phone_or_email', '系统中没有该{contactTypeName}对应的帐号', {contactTypeName}));
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
                this.props.setErrorMsg(Intl.get('login.check_contact_info_failure', '联系方式检查失败'));
            }
        });
    };

    sendMsg = () => {
        this.checkContactInfo(() => {
            const captcha = this.state.captchaCodeValue;
            const user_name = this.state.username;
            const send_type = this.state.contactType;
    
            if (!captcha) {
                this.props.setErrorMsg(Intl.get('retry.input.captcha', '请输入验证码'));
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
                        this.props.setErrorMsg(Intl.get('login.message_sent_failure', '信息发送失败'));
                    } else {
                        this.changeView(VIEWS.VERIFY_AUTH_CODE);
                        this.setState({successMsg: Intl.get('login.message_has_been_send', '信息已发送')});
                    }
                },
                error: (errorObj) => {
                    const errorMsg = errorObj && errorObj.responseJSON && errorObj.responseJSON.message;

                    if (errorMsg) {
                        this.props.setErrorMsg(errorMsg);
                    }
                }
            });
        });
    };

    getTicket = () => {
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
                    this.props.setErrorMsg(Intl.get('login.authentication_failure', '身份验证失败'));
                } else {
                    this.setState({ticket: data.ticket});
                    this.changeView(VIEWS.RESET_PASSWORD);
                }
            },
            error: () => {
                this.props.setErrorMsg(Intl.get('login.authentication_failure', '身份验证失败'));
            }
        });
    };

    resetPassword = () => {
        const ticket = this.state.ticket;
        const user_id = this.state.userId;
        let new_password = this.state.newPassword;
        //做md5
        var md5Hash = crypto.createHash('md5');
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
                    this.setState({successMsg: Intl.get('login.reset_password_success', '重置密码成功，请返回登录页用新密码登录')});
                } else {
                    this.props.setErrorMsg(Intl.get('login.reset_password_failure', '重置密码失败'));
                }
            },
            error: () => {
                this.props.setErrorMsg(Intl.get('login.reset_password_failure', '重置密码失败'));
            }
        });
    };

    render() {
        const hasWindow = this.props.hasWindow;

        return (
            <form>
                <Steps current={this.state.step}>
                    <Step title={Intl.get('login.fill_in_contact_info', '填写联系信息')} />
                    <Step title={Intl.get('login.verify_identity', '验证身份')} />
                    <Step title={Intl.get('login.set_new_password', '设置新密码')} />
                    <Step title={Intl.get('user.user.add.finish', '完成')} />
                </Steps>

                {this.getSuccessMsgBlock()}

                <div className="input-area">

                    {this.state.currentView === VIEWS.SEND_AUTH_CODE ? (
                        <div className="input-item">
                            <input tabIndex="1" placeholder={Intl.get('login.please_input_phone_or_email', '请输入手机号或邮箱')} onChange={this.handleContactInfoChange.bind(this)} />
                        </div>
                    ) : null}

                    {this.state.currentView === VIEWS.VERIFY_AUTH_CODE ? (
                        <div className="input-item">
                            <input tabIndex="1" placeholder={Intl.get('login.please_enter_contact_type_verification_code', '请输入{contactTypeName}验证码', {contactTypeName: this.state.contactTypeName})} onChange={this.handleAuthCodeChange} />
                        </div>
                    ) : null}

                    {this.state.currentView === VIEWS.RESET_PASSWORD ? (
                        <div className="input-item">
                            <input tabIndex="1" type="password" placeholder={Intl.get('login.please_enter_new_password', '请输入新密码')} onChange={this.handleNewPasswordChange} />
                        </div>
                    ) : null}

                    {this.renderCaptchaBlock(hasWindow)}
                </div>

                {this.state.currentView === VIEWS.SEND_AUTH_CODE ? (
                    <button className="login-button" type="button"
                        tabIndex="3"
                        onClick={this.sendMsg}
                        data-tracename="点击发送手机/邮箱验证码按钮"
                    >
                        {hasWindow ? Intl.get('login.send_phone_or_email_verification_code', '发送手机/邮箱验证码') : null}
                    </button>
                ) : null}

                {this.state.currentView === VIEWS.VERIFY_AUTH_CODE ? (
                    <button className="login-button" type="button"
                        tabIndex="3"
                        onClick={this.getTicket}
                        data-tracename={'点击验证' + this.state.contactTypeName + '验证码按钮'}
                    >
                        {hasWindow ? Intl.get('login.verify_phone_or_email_verification_code', '验证{contactTypeName}验证码', {contactTypeName: this.state.contactTypeName}) : null}
                    </button>
                ) : null}

                {this.state.currentView === VIEWS.RESET_PASSWORD ? (
                    <button className="login-button" type="button"
                        tabIndex="3"
                        onClick={this.resetPassword}
                        data-tracename="点击重置密码按钮"
                    >
                        {hasWindow ? Intl.get('user.batch.password.reset', '重置密码') : null}
                    </button>
                ) : null}

                {this.state.currentView === VIEWS.DONE ? (
                    <div tabIndex="1"></div>
                ) : null}
            </form>
        );
    }
}

module.exports = ForgotPassword;

