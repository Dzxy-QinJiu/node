/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/30.
 */
require('./css/register.less');
const PropTypes = require('prop-types');
import Trace from '../../lib/trace';
import {commonPhoneRegex} from '../../public/sources/utils/validate-util';
import crypto from 'crypto';
import {Form, Button, Input, Icon, Checkbox} from 'antd';
import classNames from 'classnames';
const FormItem = Form.Item;
let codeEffectiveInterval = null;
let hasInputPhone = false;
//验证码的有效时间：60s
const CODE_EFFECTIVE_TIME = 60;
const CODE_INTERVAL_TIME = 1000;
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
            formData: {
                phone: '',//手机号
                code: '',//短信验证码
                pwd: '',//密码
                rePwd: '',//确认密码
            }
        };
    }

    //获取网页的来源
    getWebReferrer() {
        var referrer = '';
        if (document.referrer.length > 0) {
            referrer = document.referrer;
        }
        try {
            if (referrer.length === 0 && opener.location.href.length > 0) {
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
            if (err) return;
            let formData = {
                phone: values.phone,
                code: values.code,
                referrer: this.getWebReferrer()
            };
            Trace.traceEvent(e, '个人注册手机号:' + formData.phone);
            let md5Hash = crypto.createHash('md5');
            md5Hash.update(values.pwd);
            formData.pwd = md5Hash.digest('hex');
            this.setState({registerErrorMsg: '', isRegistering: true});
            $.ajax({
                url: '/account/register',
                dataType: 'json',
                type: 'post',
                data: formData,
                success: data => {
                    if (data) {
                        this.setState({registerErrorMsg: '', isRegistering: false});
                        window.location.href = '/';
                    } else {
                        this.setState({registerErrorMsg: Intl.get('register.error.tip', '注册失败'), isRegistering: false});
                    }
                },
                error: xhr => {
                    this.setState({
                        registerErrorMsg: xhr.responseJSON || Intl.get('register.error.tip', '注册失败'),
                        isRegistering: false
                    });
                }
            });
        });
    }

    //验证码是否输入正确的验证
    validatePhoneCode(phone, code, successFunc) {
        $.ajax({
            url: '/phone/code/validate',
            dataType: 'json',
            type: 'get',
            data: {phone, code},
            success: data => {
                if (data) {
                    if (_.isFunction(successFunc)) successFunc();
                } else {
                    this.setState({validateCodeErrorMsg: Intl.get('errorcode.43', '验证码错误'), getCodeErrorMsg: ''});
                }
            },
            error: xhr => {
                this.setState({
                    validateCodeErrorMsg: Intl.get('register.code.validate.error', '短信验证码验证错误'),
                    getCodeErrorMsg: ''
                });
            }
        });
    }

    renderCaptchaCode() {

        if (this.state.captchaCode) {
            return (
                <span className="get-captcha-code">
                    {Intl.get('register.code.effective.time', '{second}秒后重试', {second: this.state.codeEffectiveTime})}
                </span>);
        } else {
            let cls = classNames('get-captcha-code', {
                'active': hasInputPhone,//输入电话后，获取验证码的字体高亮
            });
            return (
                <span className={cls}>
                    {Intl.get('register.get.phone.captcha.code', '获取验证码')}
                    {this.state.isLoadingValidCode ? <Icon type="loading"/> : null}
                </span>);
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
                this.setState({codeEffectiveTime});
                if (codeEffectiveTime === 0) {
                    this.setState({captchaCode: ''});
                    this.clearCodeEffectiveInterval();
                }
            }
        }, CODE_INTERVAL_TIME);
    }

    //获取短信验证码
    getValidateCode() {
        if (this.state.captchaCode) return;
        let phone = _.trim(this.props.form.getFieldValue('phone'));
        if (phone && commonPhoneRegex.test(phone)) {
            this.setState({isLoadingValidCode: true, validateCodeErrorMsg: '', getCodeErrorMsg: ''});
            $.ajax({
                url: '/phone/validate_code',
                dataType: 'json',
                type: 'get',
                data: {phone},
                success: data => {
                    hasInputPhone = false;
                    if (data) {
                        this.setState({
                            captchaCode: data,
                            getCodeErrorMsg: '',
                            validateCodeErrorMsg: '',
                            isLoadingValidCode: false
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
                    hasInputPhone = false;
                    this.setState({
                        getCodeErrorMsg: xhr.responseJSON || Intl.get('register.code.get.error', '获取短信验证码失败'),
                        validateCodeErrorMsg: '',
                        isLoadingValidCode: false
                    });
                }
            });
        }
    }

    validatePhone(rule, value, callback) {
        let phone = _.trim(value);
        if (phone) {
            if (commonPhoneRegex.test(phone)) {
                hasInputPhone = true;
                callback();
            } else {
                hasInputPhone = false;
                callback(Intl.get('register.phon.validat.tip', '请输入正确的手机号, 格式如:13877775555'));
            }
        } else {
            hasInputPhone = false;
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

    checkPass2 = (rule, value, callback) => {
        if (value && value !== this.props.form.getFieldValue('pwd')) {
            callback(Intl.get('common.password.unequal', '两次输入密码不一致'));
        } else {
            callback();
        }
    }
    // onChangeUserAgreement = (e) => {
    //     this.setState({
    //         checkedUserAgreement: e.target.checked,
    //     });
    // }
    openUserAgreement = (e) => {
        window.open('/user/agreement');
    }
    toLogin = (e) => {
        window.location.href = '/login';
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Form className='register-form' autocomplete="off">
                <Input type="password" className='password-hidden-input' name="pwd"/>
                <FormItem>
                    {getFieldDecorator('phone', {
                        rules: [{validator: this.validatePhone}],
                        validateTrigger: 'onBlur'
                    })(
                        <Input placeholder={Intl.get('user.phone', '手机号')}/>
                    )}
                    {this.state.getCodeErrorMsg || this.state.validateCodeErrorMsg ?
                        <div className="register-error-tip">
                            {this.state.getCodeErrorMsg || this.state.validateCodeErrorMsg}
                        </div> : null}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('code', {
                        rules: [{validator: this.validateCode.bind(this)}],
                        validateTrigger: 'onBlur'
                    })(
                        <Input className='captcha-code-input'
                            placeholder={Intl.get('register.phone.code', '短信验证码')}/>
                    )}
                    <div className="captcha-code-wrap" onClick={this.getValidateCode.bind(this)}>
                        {this.renderCaptchaCode()}
                    </div>
                </FormItem>
                <FormItem>
                    {getFieldDecorator('pwd', {
                        rules: [{required: true, message: Intl.get('common.input.password', '请输入密码')}],
                        validateTrigger: 'onBlur'
                    })(
                        <Input type='password' placeholder={Intl.get('common.password', '密码')}
                            autocomplete="off"/>
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('rePwd', {
                        rules: [{
                            required: true, message: Intl.get('common.password.unequal', '两次输入密码不一致')
                        }, {
                            validator: this.checkPass2
                        }],
                        validateTrigger: 'onBlur'
                    })(
                        <Input type='password' placeholder={Intl.get('common.confirm.password', '确认密码')}
                            autocomplete="off"/>
                    )}
                </FormItem>
                <div className='register-user-agreement-tip'>
                    <ReactIntl.FormattedMessage
                        id='login.user.agreement.tip'
                        defaultMessage='点击{btn}表示您已同意我们的{userAgreement}'
                        values={{
                            'btn': Intl.get('login.register', '注册'),
                            'userAgreement': (
                                <a onClick={this.openUserAgreement} data-tracename="点击《用户协议》">
                                    {Intl.get('register.user.agreement.curtao', '《用户协议》')}
                                </a>)
                        }}
                    />
                </div>
                <FormItem>
                    <Button onClick={this.submitFormData.bind(this)} data-tracename="点击注册"> 
                        {Intl.get('login.register', '注册')}
                        {this.state.isRegistering ? <Icon type="loading"/> : null}
                    </Button>
                    <div className='register-to-login' data-tracename="点击登录"> 
                        <ReactIntl.FormattedMessage
                            id='register.to.login.tip'
                            defaultMessage= '已有账号，去{login}'
                            values={{
                                'login': (
                                    <a onClick={this.toLogin}>
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