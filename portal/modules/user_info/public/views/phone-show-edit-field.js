/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/13.
 */
/**
 * 绑定电话的组件，可显示、编辑
 * 可切换状态
 */
import {Form, Input} from 'antd';
var FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
require('../css/phone-show-edit-field.less');
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {commonPhoneRegex} from 'PUB_DIR/sources/utils/consts';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
let codeEffectiveInterval = null;
//验证码的有效时间：60s
const CODE_EFFECTIVE_TIME = 60;
const CODE_INTERVAL_TIME = 1000;
class PhoneShowEditField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasGetSMSCode: false,//是否已获取短信验证码
            loading: false,
            submitErrorMsg: '',
            user_id: props.id,
            phone: props.phone,
            displayType: 'show',//展示类型：show,edit
            codeEffectiveTime: CODE_EFFECTIVE_TIME,//验证码的有效时间：60s
            getCodeErrorMsg: '',//获取验证码的错误提示
        };
    }

    setEditable(e) {
        Trace.traceEvent(e, '点击编辑手机号');
        this.setState({
            displayType: 'edit',
        });

    }

    handleSubmit(e) {
        Trace.traceEvent(e, '保存手机号的修改');
        const form = this.props.form;
        form.validateFields((err, values) => {
            if (err) return;
            function setDisplayState() {
                this.setState({
                    loading: false,
                    hasGetSMSCode: false,
                    submitErrorMsg: '',
                    phone: values.phone,
                    displayType: 'show',
                    codeEffectiveTime: CODE_EFFECTIVE_TIME,//验证码的有效时间：60s
                    getCodeErrorMsg: '',//获取验证码的
                });
            }

            if (this.state.phone === values.phone) {
                setDisplayState();
            } else {
                this.setState({
                    loading: true
                });
                $.ajax({
                    url: '/rest/bind/phone',
                    dataType: 'json',
                    type: 'put',
                    data: {user_id: this.state.user_id, phone: values.phone, code: values.code},
                    success: data => {
                        if (data) {
                            setDisplayState();
                        } else {
                            this.setState({submitErrorMsg: Intl.get('crm.219', '修改失败'), loading: false,});
                        }
                    },
                    error: xhr => {
                        this.setState({
                            submitErrorMsg: xhr.responseJSON || Intl.get('crm.219', '修改失败'),
                            loading: false
                        });
                    }
                });
            }
        });
    }


    handleCancel(e) {
        Trace.traceEvent(e, '取消编辑手机号');
        this.setState({
            loading: false,
            hasGetSMSCode: false,
            submitErrorMsg: '',
            displayType: 'show',//展示类型：show,edit
            codeEffectiveTime: CODE_EFFECTIVE_TIME,//验证码的有效时间：60s
            getCodeErrorMsg: '',//获取验证码的
        });

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
                    this.setState({hasGetSMSCode: false});
                    this.clearCodeEffectiveInterval();
                }
            }
        }, CODE_INTERVAL_TIME);
    }

    getValidateCode() {
        if (this.state.hasGetSMSCode) return;
        this.setState({hasGetSMSCode: true});
        let phone = $.trim(this.props.form.getFieldValue('phone'));
        if (phone && commonPhoneRegex.test(phone)) {
            $.ajax({
                url: '/rest/phone_code',
                dataType: 'json',
                type: 'get',
                data: {number: phone},
                success: data => {
                    if (data) {
                        this.setState({captchaCode: data, getCodeErrorMsg: ''});
                        //设置验证码有效时间为一分钟
                        this.setCodeEffectiveInterval();
                    } else {
                        this.setState({
                            hasGetSMSCode: false,
                            getCodeErrorMsg: Intl.get('register.code.get.error', '获取短信验证码失败')
                        });
                    }
                },
                error: xhr => {
                    this.setState({
                        hasGetSMSCode: false,
                        getCodeErrorMsg: xhr.responseJSON || Intl.get('register.code.get.error', '获取短信验证码失败')
                    });
                }
            });
        }
    }

    renderCaptchaCode() {
        if (this.state.hasGetSMSCode) {
            return (
                <span className="get-captcha-code">
                    {Intl.get('register.code.effective.time', '{second}秒后重试', {second: this.state.codeEffectiveTime})}
                </span>);
        } else {
            return (<span className="get-captcha-code">{Intl.get('register.get.phone.captcha.code', '获取短信验证码')}</span>);
        }
    }

    validateCode(rule, value, callback) {
        let code = $.trim(value);
        if (code) {
            callback();
        } else {
            this.setState({
                getCodeErrorMsg: '',
            });
            callback(Intl.get('retry.input.captcha', '请输入验证码'));
        }
    }

    validatePhone(rule, value, callback) {
        let phone = $.trim(value);
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

    renderPhoneBindWrap() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        let curPhone = getFieldValue('phone');
        return (
            <Form>
                <FormItem>
                    {getFieldDecorator('phone', {
                        initialValue: this.state.phone,
                        rules: [{validator: this.validatePhone}]
                    })(
                        <Input placeholder={Intl.get('user.input.phone', '请输入手机号')}/>
                    )}
                </FormItem>
                {!curPhone || curPhone === this.state.phone ? null : ( <FormItem>
                    {getFieldDecorator('code', {
                        rules: [{validator: this.validateCode.bind(this)}],
                    })(
                        <Input className='captcha-code-input'
                            placeholder={Intl.get('retry.input.captcha', '请输入验证码')}/>
                    )}
                    <div className="captcha-code-wrap" onClick={this.getValidateCode.bind(this)}>
                        {this.renderCaptchaCode()}
                    </div>
                    {this.state.getCodeErrorMsg ?
                        <div className="bind-phone-error-tip">
                            {this.state.getCodeErrorMsg}
                        </div> : null}
                </FormItem>)}
                <FormItem>
                    <SaveCancelButton loading={this.state.loading}
                        saveErrorMsg={this.state.submitErrorMsg}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleCancel={this.handleCancel.bind(this)}
                    />
                </FormItem>

            </Form>);

    }

    renderPhoneShowWrap() {
        return (
            <div className="phone-show-wrap">
                <span className="phone-show-text">
                    {this.state.phone ? this.state.phone : (
                        <span className="no-data-tip">
                            <ReactIntl.FormattedMessage
                                id='user.info.no.set.phone'
                                defaultMessage={'该用户没有手机号，{bindPhone}'}
                                values={{
                                    'bindPhone': (
                                        <a data-tracename="点击绑定手机" onClick={this.setEditable.bind(this)}>
                                            {Intl.get('user.info.binding.phone', '绑定手机号')}
                                        </a>),
                                }}/>
                        </span>)}
                </span>
                {this.state.phone ? (
                    <i className="inline-block iconfont icon-update"
                        title={Intl.get('common.update', '修改')}
                        onClick={(e) => {
                            this.setEditable(e);
                        }}/> ) : null}
            </div>);
    }

    render() {
        return (
            <div className="phone-show-edit-wrap">
                {this.state.displayType === 'show' ? this.renderPhoneShowWrap() : this.renderPhoneBindWrap()}
            </div>);
    }
}

PhoneShowEditField.propTypes = {
    id: PropTypes.string,
    phone: PropTypes.string,
    form: PropTypes.object,
};
export default Form.create()(PhoneShowEditField);

