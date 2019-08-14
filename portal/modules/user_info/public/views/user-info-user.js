var React = require('react');
const PropTypes = require('prop-types');
import {Form, Icon, message, Popconfirm} from 'antd';
var HeadIcon = require('../../../../components/headIcon');
var UserInfoAction = require('../action/user-info-actions');
var Alert = require('antd').Alert;
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var Spinner = require('../../../../components/spinner');
import BasicEditSelectField from 'CMP_DIR/basic-edit-field/select';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import UserInfoAjax from '../ajax/user-info-ajax';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import { storageUtil } from 'ant-utils';
import PhoneShowEditField from './phone-show-edit-field';
const langArray = [{key: 'zh_CN', val: '简体中文'},
    {key: 'en_US', val: 'English'},
    {key: 'es_VE', val: 'Español'}];
function noop() {
}

class UserInfo extends React.Component{

    static defaultProps = {
        editUserInfo: noop,
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
            lang: Oplate.lang || 'zh_CN',
            isBindWechat: true,//是否绑定微信
            isLoadingWechatBind: false,//是否正在绑定微信
            emailEditType: 'text', //text或edit
            //微信扫描绑定失败后，跳到个人资料界面带着失败的标识
            weChatBindErrorMsg: props.bind_error ? Intl.get('login.wechat.bind.error', '微信绑定失败') : '',//微信账号绑定的错误提示
            iconSaveError: ''//头像修改失败错误提示
        };
    }

    componentDidMount() {
        this.getWechatIsBind();
    }

    componentWillReceiveProps(nextProps) {
        if(_.get(this.state, 'formData.userId') !== _.get(nextProps, 'userInfo.userId') || this.state.userInfoFormShow !== nextProps.userInfoFormShow){
            this.setState({
                formData: $.extend(true, {}, nextProps.userInfo),
                userInfoFormShow: nextProps.userInfoFormShow
            });
        }
    }

    uploadImg(src) {
        let formData = this.state.formData;
        formData.userLogo = src;
        UserInfoAction.editUserInfo({user_logo: src}, (errorMsg) => {
            if(_.isEmpty(errorMsg)){
                this.setState({
                    formData
                });
            } else {
                this.setState({
                    iconSaveError: errorMsg
                });
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
    handleSubscribe = (e) => {
        var formData = this.state.formData;
        var configObj = {'config': true};
        if (formData.reject < 1) {
            UserInfoAction.setSubscribeEmail(configObj, this.handleSubscribeCallback.bind(this));
            Trace.traceEvent(e, '取消订阅');
        } else {
            configObj.config = false;
            UserInfoAction.setSubscribeEmail(configObj, this.handleSubscribeCallback.bind(this));
            Trace.traceEvent(e, '重新订阅');
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
                            'receive': <a onClick={this.handleSubscribe}>
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

    //激活邮箱
    activeUserEmail() {
        if (this.state.emailEnable) {
            return;
        }
        UserInfoAction.activeUserEmail((resultObj) => {
            if (resultObj.error) {
                message.error(resultObj.errorMsg);
            } else {
                message.success(
                    Intl.get('user.info.active.email', '激活邮件已发送至{email},请前往激活',{'email': _.get(this.props.userInfo, 'email')})
                );
            }
        });
    }

    //保存邮箱操作
    saveEmailEditInput = (saveObj, successFunc, errorFunc) => {
        let email = _.get(saveObj, 'email');
        UserInfoAction.editUserInfo({email: email}, (errorMsg) => {
            if(_.isEmpty(errorMsg)){
                //邮箱修改成功，恢复为未激活
                let formData = _.extend(this.state.formData, {emailEnable: false});
                this.setState({
                    formData
                });
                successFunc();
            } else {
                errorFunc(errorMsg);
            }
        });
    }

    //设置邮箱编辑状态
    setEmailEditable = () => {
        this.setState({
            emailEditType: 'edit'
        });
    }

    //更新邮箱编辑状态
    onEmailDisplayTypeChange = (type) => {
        this.setState({
            emailEditType: type
        });
    }

    renderUserInfo() {
        var _this = this;
        var formData = this.state.formData;
        //根据是否拥有邮箱改变渲染input默认文字
        let emailInputInfo = formData.email ? formData.email : ' ';
        //根据是否拥有邮箱改变编辑状态
        let isEditable = formData.email ? true : false;
        //根据邮箱状态是否激活改变渲染afterTextTip文字
        let displaInfo = formData.email ? (formData.emailEnable ? (<span className="active-info">({Intl.get('common.actived', '已激活')})</span>) :
            (<span className="active-info">(<ReactIntl.FormattedMessage
                id="user.info.no.active"
                defaultMessage={'未激活，请{active}'}
                values={{
                    'active': <a onClick={this.activeUserEmail.bind(this)} data-tracename="激活">
                        <ReactIntl.FormattedMessage id="user.info.active" defaultMessage="激活"/>
                    </a>
                }}/>)</span>)) :
            (<span>
                <ReactIntl.FormattedMessage
                    id="user.info.no.email"
                    defaultMessage={'您还没有绑定邮箱，{add-email}'}
                    values={{'add-email':
                            <a
                                data-tracename="点击绑定邮箱"
                                onClick={(e) => this.setEmailEditable(e)}>
                                {Intl.get('user.info.binding.email','绑定邮箱')}
                            </a>,
                    }}/>
            </span>);
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
                            {Intl.get('common.email', '邮箱')}
                            ：</span>
                        <span className="user-email-item">
                            <BasicEditInputField
                                id={formData.id}
                                displayType={this.state.emailEditType}
                                field="email"
                                value={emailInputInfo}
                                hasEditPrivilege={isEditable}
                                hoverShowEdit={false}
                                validators={{rules: [{
                                    required: true, message: Intl.get('user.info.email.required', '邮箱不能为空')
                                },{
                                    type: 'email', message: Intl.get('common.correct.email', '请输入正确的邮箱')
                                }]}}
                                afterTextTip={displaInfo}
                                saveEditInput={this.saveEmailEditInput}
                                onDisplayTypeChange={this.onEmailDisplayTypeChange}
                            />
                        </span>
                    </div>
                    <div className="user-info-item">
                        <span>
                            {Intl.get('user.phone', '手机号')}
                            ：</span>
                        <PhoneShowEditField id={formData.id} phone={formData.phone}/>
                    </div>
                    <div className="user-info-item">
                        <span>{Intl.get('crm.58', '微信')}：</span>
                        <span>
                            {this.state.isLoadingWechatBind ? (<Icon type="loading"/>) :
                                this.state.weChatBindErrorMsg ? (
                                    <span className="error-msg-tip">{this.state.weChatBindErrorMsg}</span>) :
                                    this.state.isBindWechat ? (
                                        <Popconfirm
                                            placement="top" onConfirm={this.unbindWechat.bind(this)}
                                            title={Intl.get('user.wechat.unbind.confim', '您确定要解除绑定微信账号？')}>
                                            <a data-tracename="解绑微信">
                                                {Intl.get('user.wechat.unbind', '解绑微信')}
                                            </a>
                                        </Popconfirm>) : (
                                        <a href="/page/login/wechat?isBindWechatAfterLogin=true" data-tracename="绑定微信">
                                            {Intl.get('register.wechat.bind.btn', '立即绑定')}
                                        </a>)}
                        </span>
                    </div>
                    <div className="user-info-item">
                        <span>
                            <ReactIntl.FormattedMessage id="common.role" defaultMessage="角色"/>
                            ：</span>
                        <span>{formData.rolesName}</span>
                    </div>
                    {hasPrivilege('GET_MANAGED_REALM') || hasPrivilege('GET_MEMBER_SELF_INFO') ? (
                        <div className="user-info-item">
                            <span>
                                <ReactIntl.FormattedMessage id="common.company" defaultMessage="公司"/>：{this.props.managedRealm}
                            </span>
                        </div>
                    ) : null}
                    { !Oplate.hideSomeItem && <div className="user-info-item">
                        <span>{Intl.get('common.user.lang', '语言')}：</span>
                        <span className="user-lang-value">
                            <BasicEditSelectField
                                id={formData.id}
                                displayText={this.getLangDisplayText()}
                                value={this.state.lang}
                                field="language"
                                selectOptions={this.getLangOptions()}
                                disabled={hasPrivilege('MEMBER_LANGUAGE_SETTING') ? false : true}
                                onSelectChange={this.onSelectLang.bind(this)}
                                cancelEditField={this.cancelEditLang.bind(this)}
                                saveEditSelect={UserInfoAjax.setUserLanguage}
                                modifySuccess={this.afterEditLangSuccess.bind(this)}
                            />
                        </span>
                    </div>}
                </div>
            );
        }
    }
    //获取是否绑定微信
    getWechatIsBind(){
        this.setState({isLoadingWechatBind: true});
        $.ajax({
            url: '/wechat/bind/check/login',
            dataType: 'json',
            type: 'get',
            success: (result) => {
                this.setState({
                    isLoadingWechatBind: false,
                    isBindWechat: result,//true:已绑定，false:未绑定
                    weChatBindErrorMsg: ''
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isLoadingWechatBind: false,
                    weChatBindErrorMsg: errorMsg.responseJSON || Intl.get('login.wechat.bind.check.error', '检查是否绑定微信出错了')
                });
            }
        });
    }

    //解绑
    unbindWechat(){
        this.setState({isLoadingWechatBind: true});
        $.ajax({
            url: '/wechat/unbind',
            dataType: 'json',
            type: 'post',
            success: (result) => {
                this.setState({
                    isLoadingWechatBind: false,
                    isBindWechat: false,
                    weChatBindErrorMsg: ''
                });
                message.success(Intl.get('user.wechat.unbind.success', '已成功解绑微信'));
            },
            error: (errorMsg) => {
                this.setState({
                    isLoadingWechatBind: false,
                    weChatBindErrorMsg: errorMsg.responseJSON || Intl.get('user.wechat.unbind.error', '解绑微信失败')
                });
            }
        });
    }

    //保存昵称操作
    saveNicknameEditInput = (saveObj, successFunc, errorFunc) => {
        let nickname = _.get(saveObj, 'nickname');
        UserInfoAction.editUserInfo({nick_name: nickname}, (errorMsg) => {
            if(_.isEmpty(errorMsg)){
                successFunc();
            } else {
                errorFunc(errorMsg);
            }
        });
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        var _this = this;
        var formData = this.state.formData;
        let values = this.props.form.getFieldsValue();
        return (
            <div className="user-info-container-div col-md-4">
                <div className="user-logo-div">
                    <div className="user-info-logo">
                        <HeadIcon headIcon={formData.userLogo} iconDescr={formData.nickName} isEdit={true}
                            onChange={this.uploadImg.bind(this)}
                            isNotShowUserName={true}
                            userName={formData.userName}
                            nickName={formData.nickName}
                            isUserHeadIcon={true}/>
                        <div className="user-info-nickname">
                            {_.get(this.state, 'iconSaveError') ? <span className="icon-save-error">{_.get(this.state, 'iconSaveError')}</span> : null}
                            <BasicEditInputField
                                displayType="text"
                                id={formData.id}
                                field="nickname"
                                value={formData.nickName}
                                hasEditPrivilege={true}
                                hoverShowEdit={false}
                                validators={[nameLengthRule]}
                                saveEditInput={this.saveNicknameEditInput}
                            />
                        </div>
                    </div>
                </div>
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
    userInfo: PropTypes.object,
    userInfoFormShow: PropTypes.bool,
    form: PropTypes.object,
    managedRealm: PropTypes.string,
    userInfoErrorMsg: PropTypes.string,
    userInfoLoading: PropTypes.bool,
    bind_error: PropTypes.bool
};

const UserInfoForm = Form.create()(UserInfo);
module.exports = UserInfoForm;
