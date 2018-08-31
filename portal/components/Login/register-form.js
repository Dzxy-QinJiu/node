/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/30.
 */
require('./css/register.less');
import {mobileRegex} from '../../public/sources/utils/consts';
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
            getCodeTip: '',//请获取验证码并输入的提示
            validateCompanyOnlyMsg: '',//验证公司标识唯一性的提示
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
        value = $.trim(value);
        if (value) {
            if (/^[a-z\-]*$/.test(value)) {
                $.ajax({
                    url: '/company/name/validate',
                    dataType: 'json',
                    type: 'get',
                    data: {name: value},
                    success: data => {
                        if (data) {
                            callback(Intl.get('register.company.name.exist', '公司标识已存在'));
                        } else {
                            callback();
                        }
                    },
                    error: xhr => {
                        callback(Intl.get('register.company.only.error', '公司标识唯一性验证失败'));
                    }
                });
            } else {
                callback(Intl.get('register.company.valid.tip', '请输入小写字母和中划线组成的公司标识'));
            }
        } else {
            callback(Intl.get('register.fill.company.name', '请输入公司标识'));
        }
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

    changeStep(step) {
        const REGISTER_STEPS = this.props.REGISTER_STEPS;
        const form = this.props.form;
        form.validateFields((err, values) => {
            if (err) return;
            let formData = this.state.formData;
            //公司唯一标识的设置
            if (this.state.currentStep === REGISTER_STEPS.COMPANY_ID_SET) {
                formData.name = $.trim(form.getFieldValue('name'));
            } else if (this.state.currentStep === REGISTER_STEPS.PHONE_VALID) {
                //手机验证
                if (this.state.captchaCode || this.state.getCodeErrorMsg === Intl.get('register.code.has.send', '短信验证码已经发送，请勿重复发送')) {//验证码已发送
                    let code = $.trim(form.getFieldValue('code'));
                    // if (code && code === this.state.captchaCode) {
                    formData.phone = $.trim(form.getFieldValue('phone'));
                    formData.code = code;
                    // } else {
                    //     this.setState({getCodeErrorMsg: Intl.get('errorcode.43', '验证码错误'), getCodeTip: ''});
                    //     return;
                    // }
                } else if (this.state.getCodeErrorMsg) {
                    //获取验证码失败了
                    return;
                } else {
                    //请获取验证码并输入的提示
                    this.setState({getCodeTip: Intl.get('register.get.code.fill.in', '请获取验证码')});
                    return;
                }
            }
            this.setState({currentStep: step, formData});
            this.props.onRegisterStepChange(step);
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
        let phone = $.trim(this.props.form.getFieldValue('phone'));
        if (phone && mobileRegex.test(phone)) {
            $.ajax({
                url: '/phone/validate/code',
                dataType: 'json',
                type: 'get',
                data: {phone},
                success: data => {
                    if (data) {
                        this.setState({captchaCode: data, getCodeErrorMsg: '', getCodeTip: ''});
                        //设置验证码有效时间为一分钟
                        this.setCodeEffectiveInterval();
                    } else {
                        this.setState({
                            getCodeErrorMsg: Intl.get('register.code.get.error', '获取短信验证码失败'),
                            getCodeTip: ''
                        });
                    }
                },
                error: xhr => {
                    this.setState({
                        getCodeErrorMsg: xhr.responseJSON || Intl.get('register.code.get.error', '获取短信验证码失败'),
                        getCodeTip: ''
                    });
                }
            });
        }
    }

    validatePhone(rule, value, callback) {
        let phone = $.trim(value);
        if (phone) {
            if (mobileRegex.test(phone)) {
                callback();
            } else {
                callback(Intl.get('register.phon.validat.tip', '请输入正确的手机号, 格式如:13877775555'));
            }
        } else {
            callback(Intl.get('user.input.phone', '请输入手机号'));
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
                                rules: [{validator: this.validatorCompanyName}]
                            })(
                                <Input placeholder={Intl.get('register.company.valid.tip', '请输入小写字母和中划线组成的公司标识')}
                                    addonAfter={COMPANY_SUFFIX}/>
                            )}
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
                                rules: [{validator: this.validatePhone}]
                            })(
                                <Input placeholder={Intl.get('user.input.phone', '请输入手机号')}/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('code', {
                                rules: [{required: true, message: Intl.get('retry.input.captcha', '请输入验证码')}],
                            })(
                                <Input className='captcha-code-input'
                                    placeholder={Intl.get('retry.input.captcha', '请输入验证码')}/>
                            )}
                            <div className="captcha-code-wrap" onClick={this.getValidateCode.bind(this)}>
                                {this.renderCaptchaCode()}
                            </div>
                            {this.state.getCodeErrorMsg || this.state.getCodeTip ?
                                <div className="register-error-tip">
                                    {this.state.getCodeErrorMsg || this.state.getCodeTip}
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
                                rules: [{required: true, message: Intl.get('common.input.password', '请输入密码')}]
                            })(
                                <Input type='password' placeholder={Intl.get('common.input.password', '请输入密码')}
                                    autocomplete="off"/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('nickname', {
                                rules: [{required: true, message: Intl.get('user.info.input.nickname', '请输入昵称')}]
                            })(
                                <Input placeholder={Intl.get('user.info.input.nickname', '请输入昵称')}/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('organization_name', {
                                rules: [{required: true, message: Intl.get('register.company.name.fill', '请输入公司名称')}]
                            })(
                                <Input placeholder={Intl.get('register.company.name.fill', '请输入公司名称')}/>
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

const PropTypes = React.PropTypes;
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