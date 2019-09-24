/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/30.
 */
require('./css/register.less');
const PropTypes = require('prop-types');
import {commonPhoneRegex} from '../../public/sources/utils/validate-util';
import crypto from 'crypto';
import {Form, Button, Steps, Input} from 'antd';
import classNames from 'classnames';
const Step = Steps.Step;
const FormItem = Form.Item;
//客套的域名
const COMPANY_SUFFIX = '.curtao.com';
let codeEffectiveInterval = null;
//验证码的有效时间：60s
const CODE_EFFECTIVE_TIME = 60;
const CODE_INTERVAL_TIME = 1000;
let validateCompanyAjax = null;
class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentStep: 0,//当前注册步骤
            captchaCode: '',//短信验证码
            codeEffectiveTime: CODE_EFFECTIVE_TIME,//验证码的有效时间：60s
            getCodeErrorMsg: '',//获取验证码的错误提示
            validateCodeErrorMsg: '',//验证码验证错误提示
            validateNameOnlyMsg: '',//验证公司标识唯一性的提示
            registerErrorMsg: '',//注册的错误提示
            formData: {
                name: '',//公司唯一标识
                phone: '',//手机号
                code: '',//短信验证码
                pwd: '',//密码
                nickname: '',//昵称
                organization_name: ''//公司名称
            }
        };
    }

    validatorCompanyName(rule, value, callback) {
        value = _.trim(value);
        if (value) {
            if (/^[a-z\-]*$/.test(value)) {
                callback();
            } else {
                if (this.state.validateNameOnlyMsg) {
                    this.setState({validateNameOnlyMsg: ''});
                }
                callback(Intl.get('register.company.valid.tip', '请输入小写字母和中划线组成的公司标识'));
            }
        } else {
            if (this.state.validateNameOnlyMsg) {
                this.setState({validateNameOnlyMsg: ''});
            }
            callback(Intl.get('register.fill.company.name', '请输入公司标识'));
        }
    }

    //公司唯一标识是否已存在的验证
    validateNameOnly(name, successFunc) {
        $.ajax({
            url: '/company/name/validate',
            dataType: 'json',
            type: 'get',
            data: {name},
            success: data => {
                if (data) {
                    this.setState({validateNameOnlyMsg: Intl.get('register.company.name.exist', '公司标识已存在')});
                } else {
                    if (_.isFunction(successFunc)) successFunc();
                }
            },
            error: xhr => {
                this.setState({validateNameOnlyMsg: Intl.get('register.company.only.error', '公司标识唯一性验证失败')});
            }
        });
    }

    //提交form表单的数据
    submitFormData() {
        const form = this.props.form;
        form.validateFields((err, values) => {
            if (err) return;
            let formData = this.state.formData;
            let md5Hash = crypto.createHash('md5');
            md5Hash.update(values.pwd);
            formData.pwd = md5Hash.digest('hex');
            formData.nickname = values.nickname;
            formData.organization_name = values.organization_name;
            this.setState({registerErrorMsg: ''});
            $.ajax({
                url: '/account/register',
                dataType: 'json',
                type: 'post',
                data: formData,
                success: data => {
                    if (data) {
                        this.setState({registerErrorMsg: ''});
                        //注册成功后切换到登录页登录
                        this.props.changeToLoginView();
                    } else {
                        this.setState({registerErrorMsg: Intl.get('register.error.tip', '注册失败')});
                    }
                },
                error: xhr => {
                    this.setState({registerErrorMsg: xhr.responseJSON || Intl.get('register.error.tip', '注册失败')});
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

    changeStep(step) {
        const REGISTER_STEPS = this.props.REGISTER_STEPS;
        const form = this.props.form;
        form.validateFields((err, values) => {
            if (err) return;
            let formData = this.state.formData;
            //公司唯一标识的设置
            if (this.state.currentStep === REGISTER_STEPS.COMPANY_ID_SET) {
                let name = _.trim(form.getFieldValue('name'));
                this.validateNameOnly(name, () => {
                    //验证通过，切换到下一步
                    formData.name = name;
                    this.setState({currentStep: step, formData});
                    this.props.onRegisterStepChange(step);
                });
            } else if (this.state.currentStep === REGISTER_STEPS.PHONE_VALID) {
                //手机验证
                let code = _.trim(form.getFieldValue('code'));
                let phone = _.trim(form.getFieldValue('phone'));
                this.validatePhoneCode(phone, code, () => {
                    formData.phone = phone;
                    formData.code = code;
                    this.setState({currentStep: step});
                    this.props.onRegisterStepChange(step);
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
            return (<span className="get-captcha-code">{Intl.get('register.get.phone.captcha.code', '获取短信验证码')}</span>);
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

    getValidateCode() {
        if (this.state.captchaCode) return;
        let phone = _.trim(this.props.form.getFieldValue('phone'));
        if (phone && commonPhoneRegex.test(phone)) {
            $.ajax({
                url: '/phone/validate_code',
                dataType: 'json',
                type: 'get',
                data: {phone},
                success: data => {
                    if (data) {
                        this.setState({captchaCode: data, getCodeErrorMsg: '', validateCodeErrorMsg: ''});
                        //设置验证码有效时间为一分钟
                        this.setCodeEffectiveInterval();
                    } else {
                        this.setState({
                            getCodeErrorMsg: Intl.get('register.code.get.error', '获取短信验证码失败'),
                            validateCodeErrorMsg: ''
                        });
                    }
                },
                error: xhr => {
                    this.setState({
                        getCodeErrorMsg: xhr.responseJSON || Intl.get('register.code.get.error', '获取短信验证码失败'),
                        validateCodeErrorMsg: ''
                    });
                }
            });
        }
    }

    validatePhone(rule, value, callback) {
        let phone = _.trim(value);
        if (phone) {
            if (commonPhoneRegex.test(phone)) {
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

    renderFormItems() {
        let formItems = null;
        const {getFieldDecorator} = this.props.form;
        const REGISTER_STEPS = this.props.REGISTER_STEPS;
        switch (this.state.currentStep) {
            case REGISTER_STEPS.COMPANY_ID_SET:
                formItems = (
                    <div className="register-step-item">
                        <FormItem hasFeedback={false}>
                            {getFieldDecorator('name', {
                                rules: [{validator: this.validatorCompanyName.bind(this)}],
                                validateTrigger: 'onBlur'
                            })(
                                <Input placeholder={Intl.get('register.company.name', '公司标识')}
                                    addonAfter={COMPANY_SUFFIX}/>
                            )}
                            {this.state.validateNameOnlyMsg ?
                                <div className="register-error-tip">
                                    {this.state.validateNameOnlyMsg}
                                </div> : null}
                        </FormItem>
                        <FormItem>
                            <Button type="primary"
                                onClick={this.changeStep.bind(this, REGISTER_STEPS.PHONE_VALID)}> {Intl.get('user.user.add.next', '下一步')}</Button>
                        </FormItem>
                    </div>);
                break;
            case REGISTER_STEPS.PHONE_VALID:
                formItems = (
                    <div className="register-step-item">
                        <FormItem>
                            {getFieldDecorator('phone', {
                                rules: [{validator: this.validatePhone}],
                                validateTrigger: 'onBlur'
                            })(
                                <Input placeholder={Intl.get('user.phone', '手机号')}/>
                            )}
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
                            {this.state.getCodeErrorMsg || this.state.validateCodeErrorMsg ?
                                <div className="register-error-tip">
                                    {this.state.getCodeErrorMsg || this.state.validateCodeErrorMsg}
                                </div> : null}
                        </FormItem>
                        <FormItem>
                            <Button type="primary"
                                onClick={this.changeStep.bind(this, REGISTER_STEPS.ACCOUNT_SET)}> {Intl.get('user.user.add.next', '下一步')}</Button>
                        </FormItem>
                    </div>);
                break;
            case REGISTER_STEPS.ACCOUNT_SET:
                formItems = (
                    <div className="register-step-item">
                        <Input type="password" className='password-hidden-input' name="pwd"/>
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
                            {getFieldDecorator('nickname', {
                                rules: [{required: true, message: Intl.get('user.info.input.nickname', '请输入昵称')}],
                                validateTrigger: 'onBlur'
                            })(
                                <Input placeholder={Intl.get('common.nickname', '昵称')}/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('organization_name', {
                                rules: [{required: true, message: Intl.get('register.company.name.fill', '请输入公司名称')}],
                                validateTrigger: 'onBlur'
                            })(
                                <Input placeholder={Intl.get('register.company.nickname', '公司名称')}/>
                            )}
                        </FormItem>
                        <FormItem>
                            <Button type="primary"
                                onClick={this.submitFormData.bind(this)}> {Intl.get('register.finished.button', '完成注册')}</Button>
                            {this.state.registerErrorMsg ?
                                <div className="register-error-tip">{this.state.registerErrorMsg}</div> : null}
                        </FormItem>
                    </div>);
                break;
        }
        return formItems;
    }

    render() {
        return (
            <div className="register-wrap">
                <Steps current={this.state.currentStep}>
                    <Step title={Intl.get('register.set.company.id', '设置公司标识')}/>
                    <Step title={Intl.get('register.valid.phone', '验证手机')}/>
                    <Step title={Intl.get('register.fill.account', '账号设置')}/>
                </Steps>
                <Form
                    className={classNames('register-form', {'register-finished-form': this.state.currentStep === this.props.REGISTER_STEPS.ACCOUNT_SET})}
                    autocomplete="off">
                    {this.renderFormItems()}
                </Form>
            </div>
        );
    }
}

RegisterForm.propTypes = {
    REGISTER_STEPS: PropTypes.object,
    onRegisterStepChange: PropTypes.func,
    changeToLoginView: PropTypes.func,
    form: PropTypes.object
};
RegisterForm.defaultProps = {
    //注册步骤map
    REGISTER_STEPS: {},
    //注册步骤修改事件
    onRegisterStepChange: function() {
    },
    //切换到登录页进行登录
    changeToLoginView: function() {
    },
    form: {}
};
export default Form.create()(RegisterForm);