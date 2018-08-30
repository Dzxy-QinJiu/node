/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/30.
 */
require('./css/register.less');
import {Form, Button, Steps, Input} from 'antd';
import classNames from 'classnames';
const Step = Steps.Step;
const FormItem = Form.Item;
//客套的域名
const COMPANY_SUFFIX = '.curtao.com';

class RegisterForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentStep: 0,//当前注册步骤
            captchaCode: '',//短信验证码
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

    }

    changeStep(step) {

        this.setState({currentStep: step});
        this.props.onRegisterStepChange(step);
    }

    renderCaptchaCode() {
        if (this.state.captchaCode) {
            return (<img ref="captcha_img" src={ this.state.captchaCode} width="120" height="40"/> );
        } else {
            return (<span className="get-captcha-code">{Intl.get('register.get.phone.captcha.code', '获取短信验证码')}</span>);
        }
    }

    renderFormItems() {
        let formItems = null;
        const {getFieldDecorator} = this.props.form;
        switch (this.state.currentStep) {
            case 0:
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
                                onClick={this.changeStep.bind(this, 1)}> {Intl.get('user.user.add.next', '下一步')}</Button>
                        </FormItem>
                    </div>);
                break;
            case 1:
                formItems = (
                    <div className="register-step-item">
                        <FormItem>
                            {getFieldDecorator('phone', {
                                rules: [{require: true, message: Intl.get('user.input.phone', '请输入手机号')}]
                            })(
                                <Input placeholder={Intl.get('user.input.phone', '请输入手机号')}/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('code', {
                                rules: [{require: true, message: Intl.get('retry.input.captcha', '请输入验证码')}]
                            })(
                                <Input className='captcha-code-input'
                                    placeholder={Intl.get('retry.input.captcha', '请输入验证码')}/>
                            )}
                            <div className="captcha-code-wrap">
                                {this.renderCaptchaCode()}
                            </div>
                        </FormItem>
                        <FormItem>
                            <Button type="primary"
                                onClick={this.changeStep.bind(this, 2)}> {Intl.get('user.user.add.next', '下一步')}</Button>
                        </FormItem>
                    </div>);
                break;
            case 2:
                formItems = (
                    <div className="register-step-item">
                        <Input type="password" className='password-hidden-input'/>
                        <FormItem>
                            {getFieldDecorator('pwd', {
                                rules: [{require: true, message: Intl.get('common.input.password', '请输入密码')}]
                            })(
                                <Input type='password' placeholder={Intl.get('common.input.password', '请输入密码')}
                                    autocomplete="new-password"/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('nickname', {
                                rules: [{require: true, message: Intl.get('user.info.input.nickname', '请输入昵称')}]
                            })(
                                <Input placeholder={Intl.get('user.info.input.nickname', '请输入昵称')}/>
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('description', {
                                rules: [{require: true, message: Intl.get('register.company.name.fill', '请输入公司名称')}]
                            })(
                                <Input placeholder={Intl.get('register.company.name.fill', '请输入公司名称')}/>
                            )}
                        </FormItem>
                        <FormItem>
                            <Button type="primary"
                                onClick={this.submitFormData.bind(this)}> {Intl.get('register.finished.button', '完成注册')}</Button>
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
                <Form className={classNames('register-form', {'register-finished-form': this.state.currentStep === 2})}
                    autocomplete="off">
                    {this.renderFormItems()}
                </Form>
            </div>
        );
    }
}

const PropTypes = React.PropTypes;
RegisterForm.propTypes = {
    onRegisterStepChange: PropTypes.func,
    form: PropTypes.object
};
RegisterForm.defaultProps = {
    //注册步骤修改事件
    onRegisterStepChange: function() {
    },
    form: {}
};
export default Form.create()(RegisterForm);