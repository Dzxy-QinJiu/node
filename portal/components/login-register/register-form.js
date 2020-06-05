/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/30.
 */
require('./css/register.less');
const PropTypes = require('prop-types');
import Trace from '../../lib/trace';
import { commonPhoneRegex, checkPassword, checkConfirmPassword } from '../../public/sources/utils/validate-util';
import { PassStrengthBar } from 'CMP_DIR/password-strength-bar';
import crypto from 'crypto';
import { Form, Input, Icon, Button, Col } from 'antd';
import { TextField } from '@material-ui/core';
import classNames from 'classnames';
const FormItem = Form.Item;
let codeEffectiveInterval = null;
//验证码的有效时间：60s
const CODE_EFFECTIVE_TIME = 60;
const CODE_INTERVAL_TIME = 1000;
let getVerifyErrorCaptchaCodeAJax = null;
var base64_prefix = 'data:image/png;base64,';
import {pcAndWechatMiniProgram} from 'PUB_DIR/sources/utils/register_util';
class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentStep: 0,//当前注册步骤
            captchaCode: '',//短信验证码
            codeEffectiveTime: CODE_EFFECTIVE_TIME,//验证码的有效时间：60s
            isLoadingValidCode: false,//正在获取验证码
            getCodeErrorMsg: '',//获取验证码的错误提示
            validateCodeErrorMsg: '',//验证码验证错误提示
            validateNameOnlyMsg: '',//验证公司标识唯一性的提示
            registerErrorMsg: '',//注册的错误提示
            phoneIsRegisted: false,//手机号是否被注册过
            phoneIsPassValid: false, //手机号验证是否通过
            isCheckingRegistedPhone: '',//记录正在验证的是否被注册过的电话
            passBarShow: false,//密码强度条是否展示
            passStrength: '',//密码强度
            verifyErrorCaptchaCode: '',//验证短信验证码出错三次后获取的短信验证码
            formData: {
                phone: '',//手机号
                code: '',//短信验证码
                pwd: '',//密码
                rePwd: '',//确认密码
            }
        };
    }

    componentWillUnmount() {
        //组件注销前，将电话是否通过验证\是否注册过的标识恢复默认值
        this.setState({ phoneIsPassValid: false, phoneIsRegisted: false });
    }
    //获取网页的来源
    getWebReferrer() {
        var referrer = '';
        if (document.referrer.length > 0) {
            referrer = document.referrer;
        }
        try {
            if (referrer.length === 0 && _.get(opener, 'location.href.length', 0) > 0) {
                referrer = opener.location.href;
            }
        } catch (e) {
            console.log('获取网页reffer出错了');
        }
        return referrer;
    }

    //提交form表单的数据
    submitFormData(e) {
        const form = this.props.form;
        form.validateFields((err, values) => {
            if (err) {
                let errorMsg = '表单验证未通过: ';
                // {phone:{errors:[{message:'错误提示'，feild:'phone'}]},
                //   code：{...}, ...}
                _.each(err, (val, key) => {
                    errorMsg += `${key}：${_.get(val, 'errors[0].message', '')};  `;
                });
                Trace.traceEvent(e, errorMsg);
                return;
            }
            // 电话已经注册过
            if (this.state.phoneIsRegisted) {
                Trace.traceEvent(e, '电话已被注册过');
                return;
            }
            // 正在注册时，不能再注册，防止连续发多次相同手机号的注册请求
            if(this.state.isRegistering) return;
            let formData = {
                phone: _.trim(values.phone),
                code: _.trim(values.code),
                referrer: this.getWebReferrer()
            };
            // 图片验证码
            if (values.verifyErrorCaptchaCode) {
                formData.captcha = _.trim(values.verifyErrorCaptchaCode);
            }
            // 此处的事件跟踪描述不可修改，因为后端会根据 “个人注册手机号:”的描述来从matomo中获取注册账号对应线索的线索描述
            Trace.traceEvent(e, '个人注册手机号:' + formData.phone);
            let md5Hash = crypto.createHash('md5');
            md5Hash.update(_.trim(values.pwd));
            formData.pwd = md5Hash.digest('hex');
            this.setState({ registerErrorMsg: '', isRegistering: true });
            $.ajax({
                url: '/account/register',
                dataType: 'json',
                type: 'post',
                data: formData,
                success: data => {
                    if (data) {
                        this.setState({ registerErrorMsg: '', isRegistering: false });
                        window.location.href = '/';
                    } else {
                        this.setState({ registerErrorMsg: Intl.get('register.error.tip', '注册失败'), isRegistering: false });
                    }
                },
                error: xhr => {
                    let errorMsg = _.get(xhr, 'responseJSON', Intl.get('register.error.tip', '注册失败'));
                    // 手机验证码验证失败三次后或图片验证码输错后，会报图片验证码错误
                    if (errorMsg === Intl.get('login.forgot.password.picture.code.error', '图片验证码错误')) {
                        this.getVerifyErrorCaptchaCode(values.phone);
                        // 没有图片验证码时，说明是手机验证码验证失败三次后，此时需提示'短信验证码错误'
                        if (!formData.captcha) {
                            errorMsg = Intl.get('login.forgot.password.phone.code.error', '短信验证码错误');
                        }
                    }
                    this.setState({
                        registerErrorMsg: errorMsg,
                        isRegistering: false
                    });
                }
            });
        });
    }

    //验证码是否输入正确的验证
    validatePhoneCode = (values, successFunc) => {
        let queryObj = {
            phone: values.phone,
            code: values.code, // 短信验证码
        };
        // 图片验证码
        if (values.verifyErrorCaptchaCode) {
            queryObj.captcha = values.verifyErrorCaptchaCode;
        }
        $.ajax({
            url: '/phone/code/validate',
            dataType: 'json',
            type: 'get',
            data: queryObj,
            success: data => {
                if (data) {
                    if (_.isFunction(successFunc)) successFunc();
                } else {
                    this.setState({ registerErrorMsg: Intl.get('login.forgot.password.phone.code.error', '短信验证码错误') });
                    this.getVerifyErrorCaptchaCode(values.phone);
                }
            },
            error: xhr => {
                let errorMsg = _.get(xhr, 'responseJSON');
                // 手机验证码验证失败三次后或图片验证码输错后，会报图片验证码错误
                if (errorMsg === Intl.get('login.forgot.password.picture.code.error', '图片验证码错误')) {
                    this.getVerifyErrorCaptchaCode(values.phone);
                    // 没有图片验证码时，说明是手机验证码验证失败三次后，此时需提示'短信验证码错误'
                    if (!values.captcha) {
                        errorMsg = Intl.get('login.forgot.password.phone.code.error', '短信验证码错误');
                    }
                }
                this.setState({
                    registerErrorMsg: _.get(xhr, 'responseJSON', Intl.get('register.error.tip', '注册失败'))
                });
            }
        });
    }
    // 短信验证码验证失败三次后获取图片验证码
    getVerifyErrorCaptchaCode = (phone, isRefresh, e) => {
        if (isRefresh) {
            Trace.traceEvent(e, '刷新图片验证码');
        }
        if (getVerifyErrorCaptchaCodeAJax) getVerifyErrorCaptchaCodeAJax.abort();
        getVerifyErrorCaptchaCodeAJax = $.ajax({
            url: '/register/captchaCode',
            dataType: 'json',
            data: { phone: _.trim(phone) },
            success: (data) => {
                this.setState({
                    verifyErrorCaptchaCode: _.get(data, 'captcha', '')
                });
            },
            error: (xhr, statusText) => {
                if(statusText !== 'abort') {
                    let errorMsg = _.get(xhr, 'responseJSON', Intl.get('retry.failed.get.code', '获取验证码错误'));
                    if (isRefresh) {
                        this.setState({ registerErrorMsg: errorMsg, verifyErrorCaptchaCode: errorMsg });
                    } else {
                        this.setState({ registerErrorMsg: errorMsg });
                    }
                }
            }
        });
    }
    renderCaptchaCode() {
        if (this.state.captchaCode) {
            return (
                <Button>
                    {Intl.get('register.code.effective.time', '{second}秒后重试', { second: this.state.codeEffectiveTime })}
                </Button>);
        } else {
            // 电话通过验证 并且 电话未被注册时，按钮才可用
            let btnEnable = this.state.phoneIsPassValid && !this.state.phoneIsRegisted;
            return (
                <Button disabled={!btnEnable} className={btnEnable ? 'captcha-btn' : ''}>
                    {Intl.get('register.get.phone.captcha.code', '获取验证码')}
                    {this.state.isLoadingValidCode ? <Icon type="loading" /> : null}
                </Button>);
        }
    }

    clearCodeEffectiveInterval() {
        if (codeEffectiveInterval) {
            clearInterval(codeEffectiveInterval);
        }
    }

    setCodeEffectiveInterval() {
        this.clearCodeEffectiveInterval();
        //设置验证码有效时间为一分钟
        let codeEffectiveTime = CODE_EFFECTIVE_TIME;
        codeEffectiveInterval = setInterval(() => {
            if (codeEffectiveTime) {
                codeEffectiveTime -= 1;
                this.setState({ codeEffectiveTime });
                if (codeEffectiveTime === 0) {
                    this.setState({ captchaCode: '' });
                    this.clearCodeEffectiveInterval();
                }
            }
        }, CODE_INTERVAL_TIME);
    }

    //获取短信验证码
    getValidateCode(e) {
        if (this.state.captchaCode || this.state.isLoadingValidCode) return;
        let phone = _.trim(this.props.form.getFieldValue('phone'));
        if (phone && commonPhoneRegex.test(phone)) {
            // 获取输入手机号的短信验证码
            Trace.traceEvent(e, '获取短信验证码，手机号:' + phone);
            this.setState({ isLoadingValidCode: true, validateCodeErrorMsg: '', getCodeErrorMsg: '' });
            $.ajax({
                url: '/phone/validate_code',
                dataType: 'json',
                type: 'get',
                data: { phone },
                success: data => {
                    if (data) {
                        this.setState({
                            captchaCode: data,
                            getCodeErrorMsg: '',
                            validateCodeErrorMsg: '',
                            isLoadingValidCode: false,
                        });
                        //设置验证码有效时间为一分钟
                        this.setCodeEffectiveInterval();
                    } else {
                        this.setState({
                            getCodeErrorMsg: Intl.get('register.code.get.error', '获取短信验证码失败'),
                            validateCodeErrorMsg: '',
                            isLoadingValidCode: false
                        });
                    }
                },
                error: xhr => {
                    // 报错后需要更新得state数据
                    let updateState = {
                        getCodeErrorMsg: xhr.responseJSON || Intl.get('register.code.get.error', '获取短信验证码失败'),
                        validateCodeErrorMsg: '',
                        isLoadingValidCode: false
                    };
                    // 手机号已被注册时
                    if (updateState.getCodeErrorMsg === Intl.get('register.phone.has.registed', '该手机号已被注册')) {
                        // 需要在手机号下面提示
                        updateState.phoneIsRegisted = true;
                        // 短信验证码下面就不用展示了
                        delete updateState.getCodeErrorMsg;
                    }
                    this.setState({ ...updateState });
                }
            });
        }
    }
    checkPhoneRegisted = () => {
        let phone = _.trim(this.props.form.getFieldValue('phone'));
        if (phone && commonPhoneRegex.test(phone)) {
            if (phone === this.state.isCheckingRegistedPhone) return;
            this.setState({ isCheckingRegistedPhone: phone });
            $.ajax({
                url: '/phone/registed/check',
                dataType: 'json',
                type: 'get',
                data: { field: 'phone', value: phone },
                success: data => {
                    if (data) {//已被注册过
                        this.setState({ phoneIsRegisted: true, isCheckingRegistedPhone: '' });
                    } else {//未注册
                        this.setState({ phoneIsRegisted: false, isCheckingRegistedPhone: '' });
                    }
                },
                error: xhr => {
                    // 检测是否注册的接口报错后仍可以激活获取短信验证码的按钮
                    this.setState({
                        phoneIsRegisted: false,
                        isCheckingRegistedPhone: ''
                    });
                }
            });
        }
    }
    onPhoneChange = (e) => {
        let phone = _.trim(e.target.value);
        let phoneIsPassValid = false;
        if (phone && commonPhoneRegex.test(phone)) {
            //电话验证通过即可点击获取短信验证码
            phoneIsPassValid = true;
        }
        // 修改电话后，将电话已被注册的提示去掉，将获取短信验证码的按钮设为不可用
        this.setState({
            phoneIsPassValid,
            phoneIsRegisted: false,
            registerErrorMsg: ''
        });
    }

    validatePhone(rule, value, callback) {
        let phone = _.trim(value);
        if (phone) {
            if (commonPhoneRegex.test(phone)) {
                // 电话通过验证后，将电话上传到matomo上记录
                Trace.traceEvent('个人注册页面', '验证手机号:' + phone);
                callback();
            } else {
                callback(Intl.get('register.phon.validat.tip', '请输入正确的手机号, 格式如:13877775555'));
            }
        } else {
            callback(Intl.get('user.input.phone', '请输入手机号'));
        }
    }

    validateCode(rule, value, callback) {
        let code = _.trim(value);
        if (code) {
            callback();
        } else {
            this.setState({
                getCodeErrorMsg: '',
                validateCodeErrorMsg: ''
            });
            callback(Intl.get('retry.input.captcha', '请输入验证码'));
        }
    }

    checkPass = (rule, value, callback) => {
        let { getFieldValue, validateFields } = this.props.form;
        let rePassWord = getFieldValue('rePwd');
        checkPassword(this, value, callback, rePassWord, () => {
            // 如果密码验证通过后，需要强制刷新下确认密码的验证，以防密码不一致的提示没有去掉
            validateFields(['rePwd'], { force: true });
        });
    };

    checkPass2 = (rule, value, callback) => {
        let { getFieldValue, validateFields } = this.props.form;
        let password = getFieldValue('pwd');
        checkConfirmPassword(value, callback, password, () => {
            // 密码存在时，如果确认密码验证通过后，需要强制刷新下密码的验证，以防密码不一致的提示没有去掉
            validateFields(['pwd'], { force: true });
        });
    }

    // onChangeUserAgreement = (e) => {
    //     this.setState({
    //         checkedUserAgreement: e.target.checked,
    //     });
    // }
    openUserAgreement = (e) => {
        Trace.traceEvent(e, '点击用户协议');
        window.open('/user/agreement');
    }
    openPrivacyPolicy = (e) => {
        Trace.traceEvent(e, '点击隐私策略');
        window.open('/privacy/policy');
    }
    toLogin = (eventTraceDescr, e) => {

        Trace.traceEvent(e, eventTraceDescr);
        pcAndWechatMiniProgram('/login');
    }
    clearErrorMsg = () => {
        this.setState({
            registerErrorMsg: ''
        });
    }
    onEnterHandler = (event) => {
        if (event && event.keyCode === 13) {
            Trace.traceEvent(event, '按enter建提交注册数据');
            this.submitFormData(event);
        }
    }
    render() {
        const { getFieldDecorator, getFieldsValue } = this.props.form;
        const values = getFieldsValue();
        return (
            <Form className='register-form' autoComplete="off" onKeyUp={this.onEnterHandler}>
                <Input type="password" className='password-hidden-input' name="pwd" />
                <FormItem>
                    {getFieldDecorator('phone', {
                        rules: [{ validator: this.validatePhone }],
                        validateTrigger: 'onBlur'
                    })(
                        <TextField
                            required
                            fullWidth
                            id="standard-basic"
                            label={Intl.get('user.phone', '手机号')}
                            color='primary'
                            value={values.phone}
                            onBlur={this.checkPhoneRegisted}
                            onChange={this.onPhoneChange}
                            autoComplete="off"
                        />
                    )}
                    {this.state.phoneIsRegisted && this.state.phoneIsPassValid ? (<div className="register-error-tip phone-registed-tip">
                        <ReactIntl.FormattedMessage
                            id="register.phone.has.registed.to.login"
                            defaultMessage='该手机号已被注册, 去 {login}'
                            values={{
                                'login': <a onClick={this.toLogin.bind(this, '手机号已被注册, 去登录')}>{Intl.get('login.login', '登录')}?</a>
                            }}
                        />
                    </div>) : null}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('code', {
                        rules: [{ validator: this.validateCode.bind(this) }]
                    })(
                        <TextField
                            required
                            fullWidth
                            className='captcha-input'
                            id="standard-basic"
                            label={Intl.get('register.phone.code', '短信验证码')}
                            color='primary'
                            autoComplete="off"
                            value={values.code}
                            onChange={this.clearErrorMsg}
                        />
                    )}
                    <div className="captcha-code-wrap" onClick={this.getValidateCode.bind(this)}>
                        {this.renderCaptchaCode()}
                    </div>
                    {this.state.getCodeErrorMsg || this.state.validateCodeErrorMsg ?
                        <div className="register-error-tip">
                            {this.state.getCodeErrorMsg || this.state.validateCodeErrorMsg}
                        </div> : null}
                </FormItem>
                {this.state.verifyErrorCaptchaCode ? (
                    <FormItem className='input-item register_captcha_wrap'>
                        {getFieldDecorator('verifyErrorCaptchaCode', {
                            rules: [{ required: true, message: Intl.get('retry.input.captcha', '请输入验证码') }]
                        })(
                            <TextField
                                fullWidth
                                className='captcha-input login-input-wrap'
                                id="standard-basic"
                                label={Intl.get('common.captcha', '验证码')}
                                color='primary'
                                autoComplete="off"
                                maxLength="4"
                                onChange={this.clearErrorMsg}
                                value={values.verifyErrorCaptchaCode}
                            />
                        )}
                        <img src={base64_prefix + this.state.verifyErrorCaptchaCode}
                            title={Intl.get('login.dim.exchange', '看不清？点击换一张')}
                            onClick={this.getVerifyErrorCaptchaCode.bind(this, values.phone, true)} />
                    </FormItem>) : null
                }
                <FormItem>
                    {getFieldDecorator('pwd', {
                        rules: [{ validator: this.checkPass.bind(this) }]
                    })(
                        <TextField
                            required
                            fullWidth
                            name="password"
                            label={Intl.get('common.password', '密码')}
                            type="password"
                            id="password"
                            autoComplete="off"
                            values={values.pwd}
                        />
                    )}
                </FormItem>
                <Col span="24" className='password-strength-wrap'>
                    {this.state.passBarShow ?
                        (<PassStrengthBar passStrength={this.state.passStrength} />) : null}
                </Col>
                <FormItem>
                    {getFieldDecorator('rePwd', {
                        rules: [{
                            validator: this.checkPass2
                        }]
                    })(
                        <TextField
                            required
                            fullWidth
                            name="password"
                            label={Intl.get('common.confirm.password', '确认密码')}
                            type="password"
                            id="password"
                            autoComplete="off"
                            values={values.rePwd}
                        />
                    )}
                </FormItem>
                <div className='register-user-agreement-tip'>
                    <ReactIntl.FormattedMessage
                        id='login.user.agreement.tip'
                        defaultMessage='点击{btn}表示您已同意我们的{userAgreement}和{privacyPolicy}'
                        values={{
                            'btn': Intl.get('login.register', '注册'),
                            'userAgreement': (
                                <a onClick={this.openUserAgreement} data-tracename="点击《用户协议》">
                                    {Intl.get('register.user.agreement.curtao', '《用户协议》')}
                                </a>),
                            'privacyPolicy': (
                                <a onClick={this.openPrivacyPolicy} data-tracename="点击《用户协议》">
                                    《{Intl.get('register.privacy.policy', '隐私政策')}》
                                </a>)
                        }}
                    />
                </div>
                <FormItem className='register-btn-form-item'>
                    <div className='register-btn'>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={this.submitFormData.bind(this)}
                            disabled={this.state.isRegistering}
                            data-tracename="点击注册"
                        >
                            {Intl.get('login.register', '注册')}
                            {this.state.isRegistering ? <Icon type="loading" /> : null}
                        </Button>
                    </div>
                    <div className='register-to-login' data-tracename="点击登录">
                        <ReactIntl.FormattedMessage
                            id='register.to.login.tip'
                            defaultMessage='已有账号，去{login}'
                            values={{
                                'login': (
                                    <a onClick={this.toLogin.bind(this, '已有账号，去登录')}>
                                        {Intl.get('login.login', '登录')}
                                    </a>)
                            }}
                        />
                    </div>
                    {this.state.registerErrorMsg ? (
                        <div className="register-error-tip">{this.state.registerErrorMsg}</div>) : null}
                </FormItem>
            </Form>);
    }
}

RegisterForm.propTypes = {
    form: PropTypes.object
};
RegisterForm.defaultProps = {
    form: {}
};
export default Form.create()(RegisterForm);
