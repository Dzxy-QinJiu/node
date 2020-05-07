/**
 * 找回密码
 */
require('./css/forgot-password.less');
var React = require('react');
import { TextField } from '@material-ui/core';
import { isPhone, commonPhoneRegex, checkPassword, checkConfirmPassword } from 'PUB_DIR/sources/utils/validate-util';
import { PassStrengthBar } from 'CMP_DIR/password-strength-bar';
var crypto = require('crypto');
import { Steps, Form, Col } from 'antd';
const Step = Steps.Step;
const FormItem = Form.Item;
const VIEWS = {
    SEND_AUTH_CODE: 'send_auth_code',
    VERIFY_AUTH_CODE: 'verify_auth_code',
    RESET_PASSWORD: 'reset_password',
};
//错误信息提示
const ERROR_MSGS = {
    NO_SERVICE: Intl.get('login.error.retry', '登录服务暂时不可用，请稍后重试'),
    ERROR_CAPTCHA: 'error-captcha'//刷新验证码失败
};
var base64_prefix = 'data:image/png;base64,';
let getCaptchaCodeAJax = null;
// 记录上一次验证通过的电话（避免每次验证通过后，同一号码会多次获取验证码，每次获取的session_id和验证码都不同无法通过验证）
let lastValidPhone = '';
class ForgotPassword extends React.Component {
    state = {
        //用户Id
        userId: '',
        //成功信息
        successMsg: '',
        //失败提示信息
        errorMsg: '',
        //验证码
        captchaCode: '',
        //当前视图
        currentView: VIEWS.SEND_AUTH_CODE,
        //当前步骤
        step: 0,
        //凭证
        ticket: '',
        passBarShow: false,//密码强度条是否展示
        passStrength: '',//密码强度
        verifyErrorCaptchaCode: '',//验证短信验证码出错三次后获取的短信验证码
        sendMsgPhone: '',//发送短信验证码的手机号，获取图片验证码时需要
    };

    componentDidMount() {
        //切换视图后，手机号输入框自动获取焦点
        const firstInput = $('.forgot-password-form input')[0];
        if (firstInput) firstInput.focus();
        // 如果登录页有输入的电话，则默认为找回密码所用的电话
        if (isPhone(this.props.userName)) {
            this.props.form.setFieldsValue({
                phone: this.props.userName,
            });
            //如果当前没有显示验证码，则去检查显示验证码
            if (!this.state.captchaCode) {
                this.getLoginCaptcha(this.props.userName);
            }
        }
    }
    componentWillUnmount() {
        lastValidPhone = '';
    }
    //获取验证码，isVerifyCode：验证短信验证码出错三次后获取短信验证码
    getLoginCaptcha = (phone, isVerifyError) => {
        if (!phone) {
            return;
        }
        if (getCaptchaCodeAJax) getCaptchaCodeAJax.abort();
        getCaptchaCodeAJax = $.ajax({
            url: '/loginCaptcha',
            dataType: 'json',
            data: {
                username: phone,
                type: VIEWS.RESET_PASSWORD,
            },
            success: (data) => {
                if (isVerifyError) {//验证短信验证码出错三次后获取的图片验证码
                    this.setState({
                        verifyErrorCaptchaCode: data
                    });
                } else {//第一步获取短信验证码前的图片验证码
                    // 记录最后一次获取验证码的电话
                    lastValidPhone = phone;
                    this.setState({
                        captchaCode: data
                    });
                }
            },
            error: (xhr,statusText) => {
                if(statusText !== 'abort') {
                    this.setState({ errorMsg: ERROR_MSGS.NO_SERVICE });
                }
            }
        });
    };

    //刷新验证码，isVerifyCode：验证短信验证码出错三次后刷新短信验证码
    refreshCaptchaCode = (e, isVerifyError) => {
        var phone = isVerifyError ? this.state.sendMsgPhone : this.props.form.getFieldValue('phone');
        if (!phone) {
            return;
        }
        var _this = this;
        $.ajax({
            url: '/refreshCaptcha',
            dataType: 'json',
            data: {
                username: phone,
                type: VIEWS.RESET_PASSWORD,
            },
            success: function(data) {
                if (isVerifyError) {//验证短信验证码出错三次后获取的图片验证码
                    _this.setState({
                        verifyErrorCaptchaCode: data
                    });
                } else {//第一步获取短信验证码前的图片验证码
                    // 记录最后一次获取验证码的电话
                    lastValidPhone = phone;
                    _this.setState({
                        captchaCode: data
                    });
                }
            },
            error: function() {
                if (isVerifyError) {//验证短信验证码出错三次后获取的图片验证码失败
                    _this.setState({
                        verifyErrorCaptchaCode: ERROR_MSGS.ERROR_CAPTCHA
                    });
                } else {//第一步获取短信验证码前的图片验证码失败
                    _this.setState({
                        captchaCode: ERROR_MSGS.ERROR_CAPTCHA
                    });
                }
            }
        });
    };

    changeView = (view) => {
        const views = [
            VIEWS.SEND_AUTH_CODE,
            VIEWS.VERIFY_AUTH_CODE,
            VIEWS.RESET_PASSWORD,
        ];
        const viewIndex = views.indexOf(view);
        const step = viewIndex > -1 ? viewIndex : 0;
        this.setState({ currentView: view, step, captchaCode: '', successMsg: '', errorMsg: '' }, () => {
            // 重置密码界面，由于前面有避免自动填充的隐藏密码框，所以获取焦点的输入框应该是input[1]
            const firstInput = view === VIEWS.RESET_PASSWORD ? $('.forgot-password-form input')[1] : $('.forgot-password-form input')[0];
            if (firstInput) firstInput.focus();
            // 如果是第一部发送短信验证码的视图，需要根据输入框中的phone获取图片验证码
            if (view === VIEWS.SEND_AUTH_CODE) {
                let phone = this.props.form.getFieldValue('phone');
                this.getLoginCaptcha(phone);
            }
        });
    };
    sendMsg = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            $.ajax({
                url: '/send_reset_password_msg',
                dataType: 'json',
                data: {
                    user_name: _.get(values, 'phone', ''),
                    captcha: _.get(values, 'captchaCode', ''),
                    send_type: 'phone',
                },
                success: (data) => {
                    if (data) {
                        this.changeView(VIEWS.VERIFY_AUTH_CODE);
                        this.setState({sendMsgPhone: _.get(values, 'phone', '')});
                    } else {
                        this.setState({
                            errorMsg: Intl.get('login.message_sent_failure', '信息发送失败')
                        });
                    }
                },
                error: (errorObj) => {
                    // 发送短信验证码失败后，刷新图片验证码
                    this.refreshCaptchaCode();
                    let errorMsg = _.get(errorObj, 'responseJSON.message', Intl.get('login.message_sent_failure', '信息发送失败'));
                    //用户名或密码错误是用户不存在时的错误码对应的描述，由于登录时也用的相同的错误码，登录时不能明确提示‘用户不存在’所以用了‘用户名或密码错误’的描述
                    if (errorMsg === Intl.get('errorcode.39', '用户名或密码错误')) {
                        errorMsg = Intl.get('errorcode.phone.unbind.account.tip', '此手机号未绑定账号，请换其他手机号再试',);
                    }
                    this.setState({ errorMsg });
                }
            });
        });
    };
    getTicket = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let submitObj = {
                user_name: this.state.sendMsgPhone,
                code: _.get(values, 'phoneCode'),
            };
            let captchaCode = values.verifyErrorCaptchaCode;
            // 验证失败三次后，需要输入图片验证码的情况
            if(captchaCode){
                submitObj.captcha = captchaCode;
            }
            $.ajax({
                url: '/get_reset_password_ticket',
                dataType: 'json',
                data: submitObj,
                success: (data) => {
                    if (!data) {
                        this.setState({ errorMsg: Intl.get('errorcode.5', '验证失败') });
                    } else {
                        this.setState({ ticket: _.get(data, 'ticket', '') });
                        this.changeView(VIEWS.RESET_PASSWORD);
                    }
                },
                error: (xhr) => {
                    let errorMsg = _.get(xhr, 'responseJSON', Intl.get('errorcode.5', '验证失败'));
                    // 短信验证码错误第四次需要输入图片验证码时、四次之后图片验证码输对了短信验证码输错时，或图片验证码错误时
                    if(errorMsg === 'verification_code_error_and_need_captcha' || errorMsg === Intl.get('login.fogot.password.picture.code.error', '图片验证码错误')){
                        this.getLoginCaptcha(this.state.sendMsgPhone, true);
                        // 短信验证码错误第四次需要输入图片验证码时、四次之后图片验证码输对了短信验证码输错时，提示短信验证码错误
                        if(errorMsg === 'verification_code_error_and_need_captcha'){
                            errorMsg = Intl.get('login.fogot.password.phone.code.error', '短信验证码错误');
                        }
                        //短信验证错误三次后，重新发送短信验证码，再验证没有输入图片验证码时也会报图片验证码错误
                        if(errorMsg === Intl.get('login.fogot.password.picture.code.error', '图片验证码错误') && !submitObj.captcha){
                            errorMsg = Intl.get('login.fogot.password.phone.code.error', '短信验证码错误');
                        }
                    }
                    this.setState({ errorMsg });
                }
            });
        });
    };

    resetPassword = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            const ticket = this.state.ticket;
            let new_password = _.get(values, 'newPassword');
            //md5加密
            var md5Hash = crypto.createHash('md5');
            md5Hash.update(new_password);
            new_password = md5Hash.digest('hex');
            $.ajax({
                url: '/reset_password_with_ticket',
                dataType: 'json',
                data: {
                    user_name: this.state.sendMsgPhone,
                    ticket,
                    new_password,
                },
                success: (data) => {
                    if (!data) {
                        this.setState({ successMsg: Intl.get('login.reset_password_success', '重置密码成功'), errorMsg: ''});
                    } else {
                        this.setState({ errorMsg: Intl.get('login.reset_password_failure', '重置密码失败'), successMsg: ''});
                    }
                },
                error: () => {
                    this.setState({ errorMsg: Intl.get('login.reset_password_failure', '重置密码失败'), successMsg: ''});
                }
            });
        });
    };
    returnLoginPage = (e) => {
        if (_.isFunction(this.props.changeView)) {
            this.props.changeView();
        }
    }

    validatePhone = (rule, value, callback) => {
        let phone = _.trim(value);
        if (phone) {
            if (commonPhoneRegex.test(phone)) {
                //当前电话跟上一次获取验证码的电话是否相同，相同的话就不用再获取了
                if (phone !== lastValidPhone) {
                    this.getLoginCaptcha(phone);
                }
                callback();
            } else {
                callback(Intl.get('register.phon.validat.tip', '请输入正确的手机号, 格式如:13877775555'));
            }
        } else {
            callback(Intl.get('user.input.phone', '请输入手机号'));
        }
    }

    checkPass = (rule, value, callback) => {
        let { getFieldValue, validateFields } = this.props.form;
        let rePassWord = getFieldValue('rePassword');
        checkPassword(this, value, callback, rePassWord, () => {
            // 如果密码验证通过后，需要强制刷新下确认密码的验证，以防密码不一致的提示没有去掉
            validateFields(['rePassword'], {force: true});
        });
    };
   
    checkPass2 = (rule, value, callback) => {
        let { getFieldValue, validateFields } = this.props.form;
        let password = getFieldValue('newPassword');
        checkConfirmPassword(value, callback, password, () => {
            // 密码存在时，如果确认密码验证通过后，需要强制刷新下密码的验证，以防密码不一致的提示没有去掉
            validateFields(['newPassword'], {force: true});
        });
    }

    clearErrorMsg = () => {
        this.setState({
            errorMsg: ''
        });
    }
    //渲染发送短信验证码的视图
    renderSendPhoneCodeView() {
        const hasWindow = this.props.hasWindow;
        const { getFieldDecorator, getFieldsValue } = this.props.form;
        const values = getFieldsValue();
        return (
            <React.Fragment>
                <FormItem className='input-item' key='phone'>
                    {getFieldDecorator('phone', {
                        rules: [{ validator: this.validatePhone.bind(this) }],
                        validateTrigger: 'onChange'
                    })(
                        <TextField
                            fullWidth
                            id="standard-basic"
                            className='login-input-wrap'
                            label={Intl.get('user.phone', '手机号')}
                            color='primary'
                            value={values.phone}
                            onChange={this.clearErrorMsg}
                            autoComplete="off"
                        />
                    )}
                </FormItem>
                {this.state.captchaCode ? (
                    <FormItem className='input-item forgot_password_captcha_wrap'>
                        {getFieldDecorator('captchaCode', {
                            rules: [{ required: true, message: Intl.get('retry.input.captcha', '请输入验证码') }],
                            validateTrigger: 'onChange'
                        })(
                            <TextField
                                fullWidth
                                className='captcha-input login-input-wrap'
                                id="standard-basic"
                                label={hasWindow ? Intl.get('common.captcha', '验证码') : null}
                                color='primary'
                                autoComplete="off"
                                maxLength="4"
                                onChange={this.clearErrorMsg}
                                value={values.captchaCode}
                            />
                        )}
                        <img src={base64_prefix + this.state.captchaCode} width="120" height="40"
                            title={Intl.get('login.dim.exchange', '看不清？点击换一张')}
                            onClick={this.refreshCaptchaCode} />
                    </FormItem>) : null
                }
                <button className="login-button"
                    onClick={this.sendMsg}
                    data-tracename="点击发送短信验证码按钮"
                >
                    {hasWindow ? Intl.get('login.send_phone_verification_code', '发送短信验证码') : null}
                </button>
            </React.Fragment>);
    }
    //渲染短信验证码的验证视图
    renderVerifyPhoneCodeView() {
        const hasWindow = this.props.hasWindow;
        const { getFieldDecorator, getFieldsValue } = this.props.form;
        const values = getFieldsValue();
        return (
            <React.Fragment>
                <FormItem className='input-item' key='phoneCode'>
                    {getFieldDecorator('phoneCode', {
                        rules: [{ required: true, message: Intl.get('login.input.phone.code', '请输入短信验证码', ) }],
                    })(
                        <TextField
                            fullWidth
                            className='captcha-input login-input-wrap'
                            id="standard-basic"
                            label={hasWindow ? Intl.get('register.phone.code', '短信验证码') : null}
                            color='primary'
                            autoComplete="off"
                            maxLength="4"
                            value={values.phoneCode}
                            onChange={this.clearErrorMsg}
                        />
                    )}
                </FormItem>
                {this.state.verifyErrorCaptchaCode ? (
                    <FormItem className='input-item forgot_password_captcha_wrap'>
                        {getFieldDecorator('verifyErrorCaptchaCode', {
                            rules: [{ required: true, message: Intl.get('retry.input.captcha', '请输入验证码') }],
                        })(
                            <TextField
                                fullWidth
                                className='captcha-input login-input-wrap'
                                id="standard-basic"
                                label={hasWindow ? Intl.get('common.captcha', '验证码') : null}
                                color='primary'
                                autoComplete="off"
                                maxLength="4"
                                onChange={this.clearErrorMsg}
                                value={values.verifyErrorCaptchaCode}
                            />
                        )}
                        <img src={base64_prefix + this.state.verifyErrorCaptchaCode} width="120" height="40"
                            title={Intl.get('login.dim.exchange', '看不清？点击换一张')}
                            onClick={this.refreshCaptchaCode.bind(this, true)} />
                    </FormItem>) : null
                }
                <button className="login-button"
                    onClick={this.getTicket}
                    data-tracename={'点击验证按钮'}
                >
                    {hasWindow ? Intl.get('login.verify.btn', '验证') : null}
                </button>
            </React.Fragment>);
    }
   
    // 渲染重置密码视图
    renderResetPasswordView() {
        const hasWindow = this.props.hasWindow;
        const { getFieldDecorator, getFieldsValue } = this.props.form;
        const values = getFieldsValue();
        return (
            <React.Fragment>
                <input type="password" className="password-hidden-input" id="hidedInput" autoComplete='on' />
                <FormItem className='input-item'>
                    {getFieldDecorator('newPassword', {
                        rules: [{
                            validator: this.checkPass
                        }]
                    })(
                        <TextField
                            fullWidth
                            className="login-input-wrap"
                            name="newPassword"
                            label={Intl.get('user.password.new.password', '新密码')}
                            type="password"
                            id="password"
                            color='primary'
                            autoComplete="off"
                            values={values.newPassword}
                            disabled={this.state.successMsg}
                            onChange={this.clearErrorMsg}
                        />
                    )}
                </FormItem>
                <Col span="24" className='password-strength-wrap'>
                    {this.state.passBarShow ?
                        (<PassStrengthBar passStrength={this.state.passStrength}/>) : null}
                </Col>
                <FormItem className='input-item'>
                    {getFieldDecorator('rePassword', {
                        rules: [{
                            required: true, message: Intl.get('common.input.confirm.password', '请输入确认密码')
                        }, {
                            validator: this.checkPass2
                        }]
                    })(
                        <TextField
                            fullWidth
                            name="rePassword"
                            label={Intl.get('common.confirm.password', '确认密码')}
                            type="password"
                            id="password"
                            autoComplete="off"
                            className="login-input-wrap"
                            color='primary'
                            disabled={this.state.successMsg}
                            values={values.rePassword}
                        />
                    )}
                </FormItem>
                <button className="login-button"
                    disabled={this.state.successMsg}
                    onClick={this.resetPassword}
                    data-tracename="点击重置密码按钮"
                >
                    {hasWindow ? Intl.get('user.batch.password.reset', '重置密码') : null}
                </button>
            </React.Fragment>);
    }
    render() {
        let TextFieldView = null;
        switch (this.state.currentView) {
            case VIEWS.SEND_AUTH_CODE://渲染发送短信验证码的视图（第一步）
                TextFieldView = this.renderSendPhoneCodeView();
                break;
            case VIEWS.VERIFY_AUTH_CODE: //渲染短信验证码的验证视图（第二步）
                TextFieldView = this.renderVerifyPhoneCodeView();
                break;
            case VIEWS.RESET_PASSWORD: //渲染重置密码视图（第三步）
                TextFieldView = this.renderResetPasswordView();
                break;
        }

        return (
            <Form className='forgot-password-form' autoComplete="off">
                <Steps current={this.state.step}>
                    <Step title={Intl.get('login.fill_in_contact_info', '填写联系信息')} />
                    <Step title={Intl.get('login.verify_identity', '验证身份')} />
                    <Step title={Intl.get('login.set_new_password', '设置新密码')} />
                </Steps>
                <div className="input-area">
                    {TextFieldView}
                    <div className='forgot-password-tip'>
                        {this.state.successMsg ? (
                            <React.Fragment>
                                <span className='success-msg'>{this.state.successMsg}，</span>
                                <a className='find-password-retry-login' data-tracename="重新登录" onClick={this.returnLoginPage}>
                                    {Intl.get('retry.login.again', '重新登录')}
                                </a>
                            </React.Fragment>
                        ) : null}
                        {this.state.errorMsg ? (
                            <div className="login-error-tip">
                                <span className="iconfont icon-warn-icon"></span>
                                {this.state.errorMsg}
                            </div>
                        ) : null}
                        {this.state.successMsg ? null : (
                            <a className='login-find-password-tip' data-tracename="返回登录页" onClick={this.returnLoginPage}>
                                {Intl.get('login.return_to_login_page', '返回登录页')}
                            </a>
                        )}
                    </div>
                </div>
            </Form>
        );
    }
}
ForgotPassword.propTypes = {
    userName: PropTypes.string,
    form: PropTypes.obj,
    changeView: PropTypes.func,
    hasWindow: PropTypes.bool
};
export default Form.create()(ForgotPassword);

