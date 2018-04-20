const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
import {Button, Form, Input, Icon, message} from "antd";
var FormItem = Form.Item;
var HeadIcon = require("../../../../components/headIcon");
var AlertTimer = require("../../../../components/alert-timer");
var defaultPhoneIcon = require("../../../common/public/image/user-info-phone-icon.png");
var UserInfoAction = require("../action/user-info-actions");
var Alert = require("antd").Alert;
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var Spinner = require("../../../../components/spinner");
import BasicEditSelectField from "CMP_DIR/basic-edit-field/select";
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import reactIntlMixin from '../../../../components/react-intl-mixin';
import UserInfoAjax from '../ajax/user-info-ajax';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import { storageUtil } from "ant-utils";

const messages = defineMessages({
    common_email: {id: 'common.email'},//邮箱
    common_is_validiting: {id: 'common.is.validiting'},//正在校验中..
    common_correct_email: {id: 'common.correct.email'},//请输入正确的邮箱
    common_required_tip: {id: 'common.required.tip'},//必填项*
    common_phone: {id: 'common.phone'}, //电话
    user_info_input_phone: {id: 'user.info.input.phone'},//请输入电话
    common_input_correct_phone: {id: 'common.input.correct.phone'},//请输入正确的电话号码
    common_nickname: {id: 'common.nickname'},//昵称
    user_info_nickname_required: {id: 'user.info.nickname.required'},//昵称不能为空

});

const langArray = [{key: "zh_CN", val: "简体中文"},
    {key: "en_US", val: "English"},
    {key: "es_VE", val: "Español"}];
function noop() {
}
function cx(classNames) {
    if (typeof classNames === 'object') {
        return Object.keys(classNames).filter(function (className) {
            return classNames[className];
        }).join(' ');
    } else {
        return Array.prototype.join.call(arguments, ' ');
    }
}
var UserInfo = React.createClass({
    mixins: [Validation.FieldMixin, reactIntlMixin],
    getDefaultProps: function () {
        return {
            editUserInfo: noop,
            userInfoFormShow: false,
            userInfo: {
                userId: "",
                userName: "",
                nickName: "",
                password: "",
                rePasswd: "",
                newPasswd: "",
                phone: "",
                email: "",
                rolesName: "",
                roles: "",
                reject: "",
            }
        }
    },
    getInitialState: function () {
        return {
            status: {
                userId: "",
                userName: "",
                nickName: "",
                password: "",
                rePasswd: "",
                newPasswd: "",
                phone: "",
                email: "",
                rolesName: "",
                roles: "",
                reject: "",

            },
            formData: $.extend(true, {}, this.props.userInfo),
            userInfoFormShow: this.props.userInfoFormShow,
            isSaving: false,
            saveErrorMsg: "",
            lang: Oplate.lang || "zh_CN"
        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.refs.validation.reset();
        this.setState({
            formData: $.extend(true, {}, nextProps.userInfo),
            userInfoFormShow: nextProps.userInfoFormShow
        });
    },
    componentDidUpdate: function () {
        if (this.state.formData.id) {
            this.refs.validation.validate(noop);
        }
    },
    //编辑用户信息
    showUserInfoForm: function () {
        UserInfoAction.showUserInfoForm();
    },

    //取消编辑用户信息
    handleCancel: function (e) {
        e.preventDefault();
        UserInfoAction.hideUserInfoForm();
    },

    //保存用户信息
    handleSubmit: function (e) {
        e.preventDefault();
        var validation = this.refs.validation;
        var _this = this;
        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                this.setState({isSaving: true});
                var userInfo = _this.state.formData;
                if (userInfo.phone) {
                    userInfo.phone = $.trim(userInfo.phone);
                }
                if (userInfo.email !== _this.props.userInfo.email) {
                    //修改邮箱后，邮箱的激活状态改为未激活
                    userInfo.emailEnable = false;
                }
                UserInfoAction.editUserInfo(userInfo, (errorMsg) => {
                    //保存后的处理
                    this.setState({isSaving: false, saveErrorMsg: errorMsg});
                });
            }
        });
    },
    hideSaveTooltip: function () {
        this.setState({saveErrorMsg: ""});
    },
    renderValidateStyle: function (item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = cx({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    //校验手机号码
    checkPhone: function (rule, value, callback) {
        var _this = this;
        value = $.trim(value);
        if (value) {
            if ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(value)) ||
                (/^\d{3,4}\-\d{7,8}$/.test(value)) ||
                (/^400\-?\d{3}\-?\d{4}$/.test(value))) {
                callback();
            } else {
                callback(new Error(_this.formatMessage(messages.common_input_correct_phone)));
            }
        } else {
            callback();
        }
    },

    uploadImg: function (src) {
        var formData = this.state.formData;
        formData.userLogo = src;
        this.setState({formData: formData});
    },
    //激活邮箱
    activeUserEmail: function () {
        var _this = this;
        if (this.state.formData.emailEnable) {
            return;
        }
        UserInfoAction.activeUserEmail((resultObj) => {
            if (resultObj.error) {
                message.error(resultObj.errorMsg);
            } else {
                message.success(
                    Intl.get("user.info.active.email", "激活邮件已发送至{email}",{"email": _this.state.formData.email})
                );
            }
        });
    },
    handleSubscribeCallback: function (resultObj) {
        if (resultObj.error) {
            message.error(resultObj.errorMsg);
        } else {
            message.success(resultObj.data);
            var formData = $.extend(true, {}, this.state.formData);
            if (this.state.formData.reject == 0) {
                formData.reject = 1;
            } else {
                formData.reject = 0;
            }
            this.setState({
                formData: formData
            })
        }

    },
    //设置邮箱订阅功能
    handleSubscribe: function () {
        var formData = this.state.formData;
        var configObj = {"config": true};
        if (formData.reject < 1) {
            UserInfoAction.setSubscribeEmail(configObj, this.handleSubscribeCallback)
        } else {
            configObj.config = false;
            UserInfoAction.setSubscribeEmail(configObj, this.handleSubscribeCallback)
        }
    },
    retryRealm: function () {
        UserInfoAction.getManagedRealm();
    },
    renderRealm: function () {

        if (this.props.realmLoading) {
            return (<Icon type="loading"/>)
        } else if (this.props.realmErrorMsg) {
            var errMsg = <span>{this.props.realmErrorMsg}<a onClick={this.retryRealm}
                                                            style={{marginLeft: "20px", marginTop: "20px"}}>
                <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
            </a></span>;
            return (
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon
                />
            )

        } else {
            return (<span>{this.props.managedRealm.realm_name}</span>);
        }
    },
    retryUserInfo: function () {
        UserInfoAction.getUserInfo();
    },
    renderReceiveEmail: function () {
        var formData = this.state.formData;
        if (formData.reject !== "" && formData.reject < 1) {
            return (
                <div>
                    <ReactIntl.FormattedMessage
                        id="user.info.reject.email"
                        defaultMessage={`如果您不想接受审批通知邮件提醒，可以{cancel}`}
                        values={{
                            'cancel': <a onClick={this.handleSubscribe}>
                                <ReactIntl.FormattedMessage id="user.info.cancel.subscribe" defaultMessage="取消订阅"/>
                            </a>
                        }}
                    />
                </div>
            )
        } else {
            return (
                <div>
                    <ReactIntl.FormattedMessage
                        id="user.info.receive.email"
                        defaultMessage={`如果您想接受审批通知邮件提醒，可以{receive}`}
                        values={{
                            'receive': <a onClick={this.handleSubscribe}>
                                <ReactIntl.FormattedMessage id="user.info.receive.subscribe" defaultMessage="重新订阅"/>
                            </a>
                        }}
                    />

                </div>
            )
        }
    },
    getLangOptions: function () {
        return langArray.map(lang=> {
            return (
                <Option key={lang.key} value={lang.key}>
                    {lang.val}
                </Option>
            );
        });
    },
    onSelectLang: function (lang) {
        this.setState({lang: lang});
    },
    cancelEditLang: function () {
        this.setState({lang: Oplate.lang || "zh_CN"});
    },
    afterEditLangSuccess: function (user) {
        storageUtil.local.set("userLang",user["language"]);
        //刷新界面，浏览器重新从服务器请求资源,在http请求头中不会包含缓存标记
        location.reload(true);
    },
    getLangDisplayText: function () {
        let lang = _.find(langArray, langObj=>langObj.key == this.state.lang);
        if (lang && lang.val) {
            return lang.val;
        } else {
            return "";
        }
    },
    renderUserInfo: function () {
        var _this = this;
        var formData = this.state.formData;
        if (this.props.userInfoErrorMsg) {
            var errMsg = <span>{this.props.userInfoErrorMsg}<a onClick={this.retryUserInfo}
                                                               style={{marginLeft: "20px", marginTop: "20px"}}>
                <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
            </a></span>;
            return (
                <div className="user-info-tip">
                    <Alert
                        message={errMsg}
                        type="error"
                        showIcon
                    />
                </div>
            )

        } else {
            return (
                <div className="user-info-div">
                    <div className="user-info-item">
                        <span>
                            <ReactIntl.FormattedMessage id="common.username" defaultMessage="用户名"/>
                            ：</span>
                        <span>{formData.userName}</span>
                    </div>
                    <div className="user-info-item">
                        <span>
                            <ReactIntl.FormattedMessage id="common.email" defaultMessage="邮箱"/>
                            ：</span>
                        <span>
                            {formData.email ? formData.email:
                                <span>
                                    <ReactIntl.FormattedMessage
                                        id="user.info.no.email"
                                        defaultMessage={`该用户没有任何邮箱信息，{add-email}`}
                                        values={{
                                            "add-email": <a data-tracename="点击添加邮箱" onClick={_this.showUserInfoForm}>{Intl.get("user.info.add.email","添加邮箱")}</a>,}}/>
                            </span>}
                        </span>
                        {formData.email ? (formData.emailEnable ? <span>（
                            <ReactIntl.FormattedMessage id="common.actived" defaultMessage="已激活"/>
                            ）</span> :
                            <span>
                                （
                                 <ReactIntl.FormattedMessage
                                     id="user.info.no.active"
                                     defaultMessage={`未激活，请{active}`}
                                     values={{
                                         'active': <a onClick={_this.activeUserEmail} data-tracename="激活">
                                             <ReactIntl.FormattedMessage id="user.info.active" defaultMessage="激活"/>
                                         </a>
                                     }}
                                 />

                                ）

                            </span>) : null}
                    </div>
                    <div className="user-info-item">
                        <span>
                            <ReactIntl.FormattedMessage id="common.phone" defaultMessage="电话"/>
                            ：</span>
                        <span>{formData.phone}</span>
                    </div>
                    <div className="user-info-item">
                        <span>
                            <ReactIntl.FormattedMessage id="common.role" defaultMessage="角色"/>
                            ：</span>
                        <span>{formData.rolesName}</span>
                    </div>
                    {  !Oplate.hideSomeItem &&  <dl className="dl-horizontal user-info-item">
                        <dt>{Intl.get("common.user.lang", "语言")}：</dt>
                        <dd>
                            <BasicEditSelectField
                                id={formData.id}
                                displayText={this.getLangDisplayText()}
                                value={this.state.lang}
                                field="language"
                                selectOptions={this.getLangOptions()}
                                disabled={hasPrivilege("MEMBER_LANGUAGE_SETTING")?false:true}
                                onSelectChange={this.onSelectLang}
                                cancelEditField={this.cancelEditLang}
                                saveEditSelect={UserInfoAjax.setUserLanguage}
                                modifySuccess={this.afterEditLangSuccess}
                            />
                        </dd>
                    </dl>}
                    <PrivilegeChecker check="GET_MANAGED_REALM">
                        <div className="user-info-item">
                            <span>
                                <ReactIntl.FormattedMessage id="user.info.realm" defaultMessage="安全域"/>：</span>
                            {this.renderRealm()}
                        </div>
                    </PrivilegeChecker>
                </div>
            )
        }
    },
    render: function () {
        var _this = this;
        var formData = this.state.formData;
        var status = this.state.status;
        return (
            <div className="user-info-container-div col-md-4">
                <div className="user-logo-div">
                    <Button className="user-info-btn-class icon-update iconfont"
                            onClick={_this.showUserInfoForm}
                            style={{display: this.props.userInfoFormShow ? "none" : "block"}}
                            data-tracename="编辑个人资料"/>
                    <div className="user-info-logo">
                        {
                            this.props.userInfoFormShow ?
                                (<HeadIcon headIcon={formData.userLogo} iconDescr={formData.nickName} isEdit={true}
                                           isNotShowUserName={true}
                                           onChange={this.uploadImg}
                                           userName={formData.userName}
                                           nickName={formData.nickName}
                                           isUserHeadIcon={true}/>) :
                                (<HeadIcon headIcon={formData.userLogo} iconDescr={formData.nickName}
                                           userName={formData.userName}
                                           nickName={formData.nickName}
                                           isUserHeadIcon={true}/>)
                        }
                    </div>
                </div>
                <div className="edit-form-div" style={{display: this.props.userInfoFormShow ? "block" : "none"}}>
                    <Form horizontal className="user-info-form">
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <FormItem
                                label={this.formatMessage(messages.common_email)}
                                id="email"
                                labelCol={{span: 4}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('email')}
                                hasFeedback
                                help={status.email.isValidating ? this.formatMessage(messages.common_is_validiting) : (status.email.errors && status.email.errors.join(','))}
                            >
                                <Validator rules={[{
                                    required: true,
                                    type: 'email',
                                    message: this.formatMessage(messages.common_correct_email)
                                }]}>
                                    <Input name="email" id="email" type="text" value={formData.email}
                                           placeholder={this.formatMessage(messages.common_required_tip)}
                                           onChange={this.setField.bind(this, 'email')}/>
                                </Validator>
                            </FormItem>
                            <FormItem
                                label={this.formatMessage(messages.common_phone)}
                                id="phone"
                                labelCol={{span: 4}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('phone')}
                                hasFeedback
                                help={status.phone.isValidating ? (this.formatMessage(messages.common_is_validiting)) : (status.phone.errors && status.phone.errors.join(','))}
                            >
                                <Validator rules={[{validator: this.checkPhone}]}>
                                    <Input name="phone" id="phone" value={formData.phone}
                                           placeholder={this.formatMessage(messages.user_info_input_phone)}
                                           onChange={this.setField.bind(this, 'phone')}/>
                                </Validator>
                            </FormItem>
                            <FormItem
                                label={this.formatMessage(messages.common_nickname)}
                                id="nickName"
                                labelCol={{span: 4}}
                                wrapperCol={{span: 18}}
                                validateStatus={this.renderValidateStyle('nickName')}
                                hasFeedback
                                help={status.nickName.isValidating ? (this.formatMessage(messages.common_is_validiting)) : (status.nickName.errors && status.nickName.errors.join(','))}
                            >
                                <Validator rules={[{
                                    required: true,
                                    message: this.formatMessage(messages.user_info_nickname_required)
                                }]}>
                                    <Input name="nickName" id="nickName" value={formData.nickName}
                                           placeholder={this.formatMessage(messages.common_required_tip)}
                                           onChange={this.setField.bind(this, 'nickName')}/>
                                </Validator>
                            </FormItem>
                            <FormItem
                                wrapperCol={{span: 22}}>
                                <Button type="ghost" className="user-info-edit-cancel-btn btn-primary-cancel"
                                        onClick={this.handleCancel} data-tracename="取消编辑个人资料">
                                    <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                                </Button>
                                <Button type="primary" className="user-info-edit-submit-btn btn-primary-sure"
                                        onClick={this.handleSubmit} data-tracename="保存个人资料">
                                    <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                                </Button>
                                {this.state.isSaving ? (<Icon type="loading"/>) : (
                                    this.state.saveErrorMsg ? (<div className="indicator">
                                        <AlertTimer time={3000}
                                                    message={this.state.saveErrorMsg}
                                                    type={"error"} showIcon
                                                    onHide={this.hideSaveTooltip}/>
                                    </div>) : null)
                                }
                            </FormItem>
                        </Validation>
                    </Form>
                </div>
                <div className="user-info-bottom" style={{display: this.props.userInfoFormShow ? "none" : "block"}}>
                    {this.props.userInfoLoading ? ( <div className="user-info-tip">
                        <Spinner />
                    </div> ) : (
                        this.renderUserInfo()
                    )}
                    <PrivilegeChecker check="MEMBER_APPLY_EMAIL_REJECTION">
                        <div className="user-tips-div">
                            <div className="user-tips-title-div">
                                <div className="user-tips-name">
                                    {this.renderReceiveEmail()}
                                </div>
                            </div>
                        </div>
                    </PrivilegeChecker>
                </div>
            </div>
        );
    }
});

module.exports = injectIntl(UserInfo);
