const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * Created by xiaojinfeng on  2016/1/14 10:25 .
 */
var language = require('../../../public/language/getLanguage');
if (language.lan() == 'es' || language.lan() == 'en') {
    require('./css/user-password-es_VE.less');
} else if (language.lan() == 'zh') {
    require('./css/user-password-zh_CN.less');
}
var Button = require('antd').Button;
var Form = require('antd').Form;
var Input = require('antd').Input;
var FormItem = Form.Item;
var Col = require('antd').Col;
var Icon = require('antd').Icon;
var crypto = require('crypto');//用于密码md5
var AlertTimer = require('../../../components/alert-timer');

//顶部导航
var TopNav = require('../../../components/top-nav');
var UserInfoStore = require('../../user_info/public/store/user-info-store');
var UserInfoAction = require('../../user_info/public/action/user-info-actions');
var userInfoAjax = require('../../user_info/public/ajax/user-info-ajax');
var passwdStrengthFile = require('../../../components/password-strength-bar');
var PasswdStrengthBar = passwdStrengthFile.PassStrengthBar;

import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import reactIntlMixin from '../../../components/react-intl-mixin';

const messages = defineMessages({
    common_required_tip: {id: 'common.required.tip'},//"必填项*"
    common_password_compose_rule: {id: 'common.password.compose.rule'},//"6-18位字符(由数字，字母，符号组成)"
    common_input_confirm_password: {id: 'common.input.confirm.password'},//"请输入确认密码"
    user_password_initial_password: {id: 'user.password.initial.password'},//"原始密码"
    common_password_length: {id: 'common.password.length'},//"密码长度应大于6位小于18位"
    user_password_input_initial_password: {id: 'user.password.input.initial.password'},//"请输入原密码"
    user_password_new_password: {id: 'user.password.new.password'},//"新密码",
    common_confirm_password: {id: 'common.confirm.password'},//"确认密码"
    common_password_unequal: {id: 'common.password.unequal'},//"两次输入密码不一致！",
    user_password_input_again: {id: 'user.password.input.again'},//"原密码不正确，请重新输入。"
    common_input_password: {id: 'common.input.password'}, //"请输入密码",
    user_password_change_password_succ: {id: 'user.password.change.password.succ'},//密码修改成功

});

function cx(classNames) {
    if (typeof classNames === 'object') {
        return Object.keys(classNames).filter(function(className) {
            return classNames[className];
        }).join(' ');
    } else {
        return Array.prototype.join.call(arguments, ' ');
    }
}

function noop() {
}

function getStateFromStore() {
    let stateData = UserInfoStore.getState();
    return {
        userId: stateData.userInfo.id,
        userInfoFormPwdShow: stateData.userInfoFormPwdShow,
        submitErrorMsg: stateData.submitErrorMsg,
        submitResult: stateData.submitResult
    };
}

var UserPwdPage = React.createClass({
    mixins: [Validation.FieldMixin, reactIntlMixin],
    getInitialState: function() {
        var datas = getStateFromStore();
        datas.status = {
            passwd: {},
            newPasswd: {},
            rePasswd: {}
        };
        datas.formData = {
            passwd: '',
            newPasswd: '',
            rePasswd: ''
        };
        datas.passBarShow = false;//是否显示密码强度
        datas.passStrength = 'L';//密码强度
        return datas;
    },
    onChange: function() {
        var datas = getStateFromStore();
        this.setState(datas);
        this.setState({
            status: this.state.status,
            formData: this.state.formData
        });
        if (this.state.userInfoFormPwdShow) {
            this.handleReset();
        }
    },
    componentDidMount: function() {
        $('body').css('overflow', 'hidden');
        UserInfoStore.listen(this.onChange);
        UserInfoAction.getUserInfo();
    },
    componentWillUnmount: function() {
        $(window).unbind('resize');
        UserInfoStore.unlisten(this.onChange);
        $('body').css('overflow', 'auto');
    },


    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = cx({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    checkPass(rule, value, callback) {
        if (value && value.match(passwdStrengthFile.passwordRegex)) {
            //获取密码强度及是否展示
            var passStrengthObj = passwdStrengthFile.getPassStrenth(value);
            this.setState({
                passBarShow: passStrengthObj.passBarShow,
                passStrength: passStrengthObj.passStrength
            });

            if (this.state.formData.newPasswd) {
                this.refs.validation.forceValidate(['rePasswd']);
            }
            callback();
        } else {
            this.setState({
                passBarShow: false,
                passStrength: 'L'
            });
            callback(Intl.get('common.password.validate.rule', '请输入6-18位数字、字母、符号组成的密码'));
        }
    },

    checkPass2(rule, value, callback) {
        var _this = this;
        if (value && value !== this.state.formData.newPasswd) {
            callback(_this.formatMessage(messages.common_password_unequal));
        } else {
            callback();
        }
    },

    checkUserInfoPwd(rule, value, callback) {
        var _this = this;
        if (!value) {
            callback();
        } else {
            setTimeout(function() {

                userInfoAjax.checkUserInfoPwd({passwd: value}).then(function(checkPwdFlag) {
                    if (!checkPwdFlag) {
                        callback(_this.formatMessage(messages.user_password_input_again));
                    } else {
                        callback();
                    }
                });

            }, 800);
        }
    },
    handleReset() {
        this.refs.validation.reset();
        this.setState(this.getInitialState());
    },
    events: {
        submitUserInfoForm: function(e) {
            e.preventDefault();
            var validation = this.refs.validation;
            var _this = this;
            validation.validate(function(valid) {
                if (!valid) {
                    return;
                } else {
                    var user = {
                        userId: '',
                        passwd: '',
                        newPasswd: ''
                    };
                    var userInfo = _this.state.formData;
                    user.newPasswd = _this.md5Hash(userInfo.newPasswd);
                    user.passwd = _this.md5Hash(userInfo.passwd);
                    user.userId = _this.state.userId;
                    UserInfoAction.editUserInfoPwd(user);
                }
            });
        }
    },

    md5Hash: function(passwd) {
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(passwd);
        return md5Hash.digest('hex');
    },

    renderIndicator: function() {
        if (this.state.submitResult === 'loading') {
            return (
                <Icon type="loading"/>
            );
        }
        var hide = function() {
            UserInfoAction.hideSubmitTip();
        };
        if (this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={this.formatMessage(messages.user_password_change_password_succ)}
                    type="success" showIcon onHide={hide}/>
            );
        }
        if (this.state.submitResult === 'error') {
            return (
                <AlertTimer time={3000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide}/>
            );
        }
        return null;
    },

    render: function() {
        var _this = this;
        var formData = this.state.formData;
        var status = this.state.status;
        return (
            <div className="userInfoManage_userPwd_content" data-tracename="密码管理">
                <div className="user-pwd-manage-container">
                    <TopNav>
                        <TopNav.MenuList />
                    </TopNav>
                    <div className="user-pwd-manage-div">
                        <Form horizontal className="user-info-edit-pwd-form" autoComplete="off">
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                <FormItem
                                    id="passwd"
                                    label={this.formatMessage(messages.user_password_initial_password)}
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 15}}
                                    validateStatus={this.renderValidateStyle('passwd')}
                                    help={status.passwd.errors ? status.passwd.errors.join(',') : null}
                                    hasFeedback
                                >
                                    <Validator
                                        rules={[{
                                            required: true,
                                            message: this.formatMessage(messages.user_password_input_initial_password)
                                        }]}>
                                        <Input type="password" id="password" name="passwd"
                                            placeholder={this.formatMessage(messages.common_input_password)}
                                            onContextMenu={noop}
                                            onPaste={noop}
                                            onCopy={noop}
                                            onCut={noop}
                                            autoComplete="off"
                                            value={formData.passwd}
                                            data-tracename="输入原密码"

                                        />

                                    </Validator>
                                </FormItem>
                                <FormItem
                                    label={this.formatMessage(messages.user_password_new_password)}
                                    id="password1"
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 15}}
                                    validateStatus={this.renderValidateStyle('newPasswd')}
                                    hasFeedback
                                    help={status.newPasswd.errors ? status.newPasswd.errors.join(',') : null}
                                >
                                    <Validator
                                        rules={[{validator: this.checkPass}]}>
                                        <Input
                                            name="newPasswd"
                                            id="password1"
                                            type="password"
                                            onContextMenu={noop}
                                            onPaste={noop}
                                            onCopy={noop}
                                            onCut={noop}
                                            autoComplete="off"
                                            value={formData.newPasswd}
                                            placeholder={this.formatMessage(messages.common_password_compose_rule)}
                                            data-tracename="输入新密码"
                                        />
                                    </Validator>
                                </FormItem>
                                <Col span="23">
                                    {this.state.passBarShow ?
                                        (<PasswdStrengthBar passStrength={this.state.passStrength}/>) : null}
                                </Col>
                                <FormItem
                                    label={this.formatMessage(messages.common_confirm_password)}
                                    id="password2"
                                    labelCol={{span: 5}}
                                    wrapperCol={{span: 15}}
                                    validateStatus={this.renderValidateStyle('rePasswd')}
                                    hasFeedback
                                    help={status.rePasswd.errors ? status.rePasswd.errors.join(',') : null}
                                >
                                    <Validator rules={[{
                                        required: true,
                                        whitespace: true,
                                        message: this.formatMessage(messages.common_password_unequal)
                                    }, {validator: this.checkPass2}]}
                                    >
                                        <Input
                                            name="rePasswd"
                                            id="password2"
                                            type="password"
                                            onContextMenu={noop}
                                            onPaste={noop}
                                            onCopy={noop}
                                            onCut={noop}
                                            autoComplete="off"
                                            value={formData.rePasswd}
                                            placeholder={this.formatMessage(messages.common_input_confirm_password)}
                                            data-tracename="确认新密码"
                                        />
                                    </Validator>
                                </FormItem>
                                <div className="user-pwd-indicator">
                                    {
                                        this.renderIndicator()
                                    }
                                    <Button type="primary" className="user-info-edit-pwd-submit-btn btn-primary-sure"
                                        onClick={this.events.submitUserInfoForm.bind(_this)}
                                        data-tracename="保存密码"
                                    >

                                        <ReactIntl.FormattedMessage id="user.password.save.password"
                                            defaultMessage="保存密码"/>
                                    </Button>
                                </div>
                            </Validation>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = injectIntl(UserPwdPage);
