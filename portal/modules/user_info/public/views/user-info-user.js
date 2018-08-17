const Validation = require('rc-form-validation');
import {Button, Form, Input, Icon, message} from 'antd';
const FormItem = Form.Item;
var HeadIcon = require('../../../../components/headIcon');
var AlertTimer = require('../../../../components/alert-timer');
var defaultPhoneIcon = require('../../../common/public/image/user-info-phone-icon.png');
var UserInfoAction = require('../action/user-info-actions');
var Alert = require('antd').Alert;
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var Spinner = require('../../../../components/spinner');
import BasicEditSelectField from 'CMP_DIR/basic-edit-field/select';
import UserInfoAjax from '../ajax/user-info-ajax';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import { storageUtil } from 'ant-utils';

const langArray = [{key: 'zh_CN', val: '简体中文'},
    {key: 'en_US', val: 'English'},
    {key: 'es_VE', val: 'Español'}];
function noop() {
}
function cx(classNames) {
    if (typeof classNames === 'object') {
        return Object.keys(classNames).filter(function(className) {
            return classNames[className];
        }).join(' ');
    } else {
        return Array.prototype.join.call(arguments, ' ');
    }
}
class UserInfo extends React.Component{

    static defaultProps = {
        editUserInfo: noop,
        userInfoFormShow: false,
        userInfo: {
            userId: '',
            userName: '',
            nickName: '',
            password: '',
            rePasswd: '',
            newPasswd: '',
            phone: '',
            email: '',
            rolesName: '',
            roles: '',
            reject: '',
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            formData: $.extend(true, {}, this.props.userInfo),
            userInfoFormShow: this.props.userInfoFormShow,
            isSaving: false,
            saveErrorMsg: '',
            lang: Oplate.lang || 'zh_CN'
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            formData: $.extend(true, {}, nextProps.userInfo),
            userInfoFormShow: nextProps.userInfoFormShow
        });
    }

    //编辑用户信息
    showUserInfoForm() {
        UserInfoAction.showUserInfoForm();
    }

    //取消编辑用户信息
    handleCancel(e) {
        e.preventDefault();
        UserInfoAction.hideUserInfoForm();
    }

    //保存用户信息
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values ) => {
            if (err) {
                return;
            } else {
                this.setState({isSaving: true});
                let userInfo = _.extend({}, values);
                if (userInfo.phone) {
                    userInfo.phone = $.trim(userInfo.phone);
                }
                if (userInfo.email !== this.props.userInfo.email) {
                    //修改邮箱后，邮箱的激活状态改为未激活
                    userInfo.emailEnable = false;
                }
                if (userInfo.nickName) {
                    userInfo.nickName = $.trim(userInfo.nickName);
                }
                UserInfoAction.editUserInfo(userInfo, (errorMsg) => {
                    //保存后的处理
                    this.setState({isSaving: false, saveErrorMsg: errorMsg});
                });
            }
        });
    }
    hideSaveTooltip() {
        this.setState({saveErrorMsg: ''});
    }

    //校验手机号码
    checkPhone(rule, value, callback) {
        value = $.trim(value);
        if (value) {
            if ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(value)) ||
                (/^\d{3,4}\-\d{7,8}$/.test(value)) ||
                (/^400\-?\d{3}\-?\d{4}$/.test(value))) {
                callback();
            } else {
                callback(new Error(Intl.get('common.input.correct.phone','请输入正确的电话号码')));
            }
        } else {
            callback();
        }
    }

    uploadImg(src) {
        let formData = this.state.formData;
        formData.userLogo = src;
        this.setState({formData: formData});
    }
    //激活邮箱
    activeUserEmail() {
        let values = this.props.form.getFieldsValue();
        if (values.emailEnable) {
            return;
        }
        UserInfoAction.activeUserEmail((resultObj) => {
            if (resultObj.error) {
                message.error(resultObj.errorMsg);
            } else {
                message.success(
                    Intl.get('user.info.active.email', '激活邮件已发送至{email}',{'email': values.email})
                );
            }
        });
    }
    handleSubscribeCallback(resultObj) {
        if (resultObj.error) {
            message.error(resultObj.errorMsg);
        } else {
            message.success(resultObj.data);
            var formData = $.extend(true, {}, this.state.formData);
            if (this.state.formData.reject === 0) {
                formData.reject = 1;
            } else {
                formData.reject = 0;
            }
            this.setState({
                formData: formData
            });
        }

    }
    //设置邮箱订阅功能
    handleSubscribe() {
        var formData = this.state.formData;
        var configObj = {'config': true};
        if (formData.reject < 1) {
            UserInfoAction.setSubscribeEmail(configObj, this.handleSubscribeCallback.bind(this));
        } else {
            configObj.config = false;
            UserInfoAction.setSubscribeEmail(configObj, this.handleSubscribeCallback.bind(this));
        }
    }
    retryRealm() {
        UserInfoAction.getManagedRealm();
    }
    renderRealm() {

        if (this.props.realmLoading) {
            return (<Icon type="loading"/>);
        } else if (this.props.realmErrorMsg) {
            var errMsg = <span>{this.props.realmErrorMsg}<a onClick={this.retryRealm.bind(this)}
                style={{marginLeft: '20px', marginTop: '20px'}}>
                <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
            </a></span>;
            return (
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon
                />
            );

        } else {
            return (<span>{this.props.managedRealm.realm_name}</span>);
        }
    }
    retryUserInfo() {
        UserInfoAction.getUserInfo();
    }
    renderReceiveEmail() {
        var formData = this.state.formData;
        if (formData.reject !== '' && formData.reject < 1) {
            return (
                <div>
                    <ReactIntl.FormattedMessage
                        id="user.info.reject.email"
                        defaultMessage={'如果您不想接受审批通知邮件提醒，可以{cancel}'}
                        values={{
                            'cancel': <a onClick={this.handleSubscribe}>
                                <ReactIntl.FormattedMessage id="user.info.cancel.subscribe" defaultMessage="取消订阅"/>
                            </a>
                        }}
                    />
                </div>
            );
        } else {
            return (
                <div>
                    <ReactIntl.FormattedMessage
                        id="user.info.receive.email"
                        defaultMessage={'如果您想接受审批通知邮件提醒，可以{receive}'}
                        values={{
                            'receive': <a onClick={this.handleSubscribe.bind(this)}>
                                <ReactIntl.FormattedMessage id="user.info.receive.subscribe" defaultMessage="重新订阅"/>
                            </a>
                        }}
                    />

                </div>
            );
        }
    }
    getLangOptions() {
        return langArray.map(lang => {
            return (
                <Option key={lang.key} value={lang.key}>
                    {lang.val}
                </Option>
            );
        });
    }
    onSelectLang(lang) {
        this.setState({lang: lang});
    }
    cancelEditLang() {
        this.setState({lang: Oplate.lang || 'zh_CN'});
    }
    afterEditLangSuccess(user) {
        storageUtil.local.set('userLang',user['language']);
        //刷新界面，浏览器重新从服务器请求资源,在http请求头中不会包含缓存标记
        location.reload(true);
    }
    getLangDisplayText() {
        let lang = _.find(langArray, langObj => langObj.key === this.state.lang);
        if (lang && lang.val) {
            return lang.val;
        } else {
            return '';
        }
    }
    renderUserInfo() {
        var _this = this;
        var formData = this.state.formData;
        if (this.props.userInfoErrorMsg) {
            var errMsg = <span>{this.props.userInfoErrorMsg}<a onClick={this.retryUserInfo.bind(this)}
                style={{marginLeft: '20px', marginTop: '20px'}}>
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
            );

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
                            {formData.email ? formData.email :
                                <span>
                                    <ReactIntl.FormattedMessage
                                        id="user.info.no.email"
                                        defaultMessage={'该用户没有任何邮箱信息，{add-email}'}
                                        values={{
                                            'add-email': <a data-tracename="点击添加邮箱" onClick={this.showUserInfoForm.bind(this)}>{Intl.get('user.info.add.email','添加邮箱')}</a>,}}/>
                                </span>}
                        </span>
                        {formData.email ? (formData.emailEnable ? <span>（
                            <ReactIntl.FormattedMessage id="common.actived" defaultMessage="已激活"/>
                            ）</span> :
                            <span>
                                （
                                <ReactIntl.FormattedMessage
                                    id="user.info.no.active"
                                    defaultMessage={'未激活，请{active}'}
                                    values={{
                                        'active': <a onClick={this.activeUserEmail.bind(this)} data-tracename="激活">
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
                    { !Oplate.hideSomeItem && <dl className="dl-horizontal user-info-item">
                        <dt>{Intl.get('common.user.lang', '语言')}：</dt>
                        <dd>
                            <BasicEditSelectField
                                id={formData.id}
                                displayText={this.getLangDisplayText.bind(this)}
                                value={this.state.lang}
                                field="language"
                                selectOptions={this.getLangOptions.bind(this)}
                                disabled={hasPrivilege('MEMBER_LANGUAGE_SETTING') ? false : true}
                                onSelectChange={this.onSelectLang.bind(this)}
                                cancelEditField={this.cancelEditLang.bind(this)}
                                saveEditSelect={UserInfoAjax.setUserLanguage}
                                modifySuccess={this.afterEditLangSuccess.bind(this)}
                            />
                        </dd>
                    </dl>}
                    <PrivilegeChecker check="GET_MANAGED_REALM">
                        <div className="user-info-item">
                            <span>
                                <ReactIntl.FormattedMessage id="user.info.realm" defaultMessage="安全域"/>：</span>
                            {this.renderRealm.bind(this)}
                        </div>
                    </PrivilegeChecker>
                </div>
            );
        }
    }
    render() {
        const {getFieldDecorator} = this.props.form;
        var _this = this;
        var formData = this.state.formData;
        let values = this.props.form.getFieldsValue();
        return (
            <div className="user-info-container-div col-md-4">
                <div className="user-logo-div">
                    <Button className="user-info-btn-class icon-update iconfont"
                        onClick={_this.showUserInfoForm}
                        data-tracename="编辑个人资料"/>
                    <div className="user-info-logo">
                        {
                            this.props.userInfoFormShow ?
                                (<HeadIcon headIcon={formData.userLogo} iconDescr={formData.nickName} isEdit={true}
                                    isNotShowUserName={true}
                                    onChange={this.uploadImg.bind(this)}
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

                {this.props.userInfoFormShow ? <div className="edit-form-div">
                    <Form horizontal className="user-info-form">
                        <FormItem
                            label={Intl.get('common.email', '邮箱')}
                            id="email"
                            labelCol={{span: 4}}
                            wrapperCol={{span: 18}}
                        >
                            {getFieldDecorator('email',{
                                initialValue: formData.email,
                                rules: [{
                                    required: true, message: Intl.get('user.info.email.required', '邮箱不能为空')
                                },{
                                    type: 'email', message: Intl.get('common.correct.email', '请输入正确的邮箱')
                                }]
                            })(
                                <Input type="text" placeholder={Intl.get('member.input.email', '请输入邮箱')}/>
                            )}
                        </FormItem>
                        <FormItem
                            label={Intl.get('common.phone','电话')}
                            id="phone"
                            labelCol={{span: 4}}
                            wrapperCol={{span: 18}}
                        >
                            {getFieldDecorator('phone',{
                                initialValue: formData.phone,
                                rules: [{
                                    validator: this.checkPhone.bind(this)
                                }]
                            })(
                                <Input placeholder={Intl.get('user.info.input.phone','请输入电话')}/>
                            )}
                        </FormItem>
                        <FormItem
                            label={Intl.get('common.nickname','昵称')}
                            id="nickName"
                            labelCol={{span: 4}}
                            wrapperCol={{span: 18}}
                        >
                            {getFieldDecorator('nickName',{
                                initialValue: formData.nickName,
                                rules: [{
                                    required: true, message: Intl.get('user.info.nickname.required','昵称不能为空')
                                }]
                            })(
                                <Input type="text" placeholder={Intl.get('user.info.input.nickname', '请输入昵称')}/>
                            )}
                        </FormItem>
                        <FormItem
                            wrapperCol={{span: 22}}>
                            <Button type="ghost" className="user-info-edit-cancel-btn btn-primary-cancel"
                                onClick={this.handleCancel.bind(this)} data-tracename="取消编辑个人资料">
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                            </Button>
                            <Button type="primary" className="user-info-edit-submit-btn btn-primary-sure"
                                onClick={this.handleSubmit.bind(this)} data-tracename="保存个人资料">
                                <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                            </Button>
                            {this.state.isSaving ? (<Icon type="loading"/>) : (
                                this.state.saveErrorMsg ? (<div className="indicator">
                                    <AlertTimer time={3000}
                                        message={this.state.saveErrorMsg}
                                        type={'error'} showIcon
                                        onHide={this.hideSaveTooltip.bind(this)}/>
                                </div>) : null)
                            }
                        </FormItem>
                    </Form>
                </div> : null}
                {!this.props.userInfoFormShow ? <div className="user-info-bottom">
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
                </div> : null}
            </div>
        );
    }
}

UserInfo.propTypes = {
    userInfo: React.PropTypes.object,
    userInfoFormShow: React.PropTypes.bool,
    form: React.PropTypes.object,
    realmLoading: React.PropTypes.bool,
    realmErrorMsg: React.PropTypes.string,
    managedRealm: React.PropTypes.object,
    userInfoErrorMsg: React.PropTypes.string,
    userInfoLoading: React.PropTypes.bool,
};

const UserInfoForm = Form.create()(UserInfo);
module.exports = UserInfoForm;
