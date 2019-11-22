import {Form, Icon, message, Popconfirm, Popover,Button} from 'antd';
var HeadIcon = require('../../../../components/headIcon');
var UserInfoAction = require('../action/user-info-actions');
var Alert = require('antd').Alert;
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var Spinner = require('../../../../components/spinner');
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import UserInfoAjax from '../ajax/user-info-ajax';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import { storageUtil } from 'ant-utils';
import PhoneShowEditField from './phone-show-edit-field';
import userData from 'PUB_DIR/sources/user-data';
import {checkQQ, emailRegex} from 'PUB_DIR/sources/utils/validate-util';
import {getEmailActiveUrl, checkCurrentVersion, checkCurrentVersionType, isCurtao} from 'PUB_DIR/sources/utils/common-method-util';
import {getOrganizationInfo} from 'PUB_DIR/sources/utils/common-data-util';
import {paymentEmitter} from 'PUB_DIR/sources/utils/emitters';
import history from 'PUB_DIR/sources/history';
import privilegeConst_user_info from '../privilege-config';
const session = storageUtil.session;
const CLOSE_TIP_TIME = 56;
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
            qq: ''
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
            qqEditType: 'text', // text或edit
            //微信扫描绑定失败后，跳到个人资料界面带着失败的标识
            weChatBindErrorMsg: props.bind_error ? Intl.get('login.wechat.bind.error', '微信绑定失败') : '',//微信账号绑定的错误提示
            iconSaveError: '',//头像修改失败错误提示
            sendMail: false,//是否已发送邮件
            closeMsg: true,//关闭提示
            sendTime: 60,//计时器显示时间
            versionName: '', // 版本信息
            endTime: '', // 到期时间
        };
    }

    componentDidMount() {
        paymentEmitter.on(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
        this.getWechatIsBind();
        this.getSendTime();
        getOrganizationInfo().then( (result) => {
            this.setState({
                versionName: _.get(result, 'version.type'),
                endTime: _.get(result, 'end_time')
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        if(_.get(this.state, 'formData.userId') !== _.get(nextProps, 'userInfo.userId') || this.state.userInfoFormShow !== nextProps.userInfoFormShow){
            this.setState({
                formData: $.extend(true, {}, nextProps.userInfo),
                userInfoFormShow: nextProps.userInfoFormShow
            });
        }
        if(nextProps.userInfo.emailEnable){
            this.setState({sendMail: false});
        }
    }

    componentWillUnmount() {
        paymentEmitter.removeListener(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
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
                userData.setUserData('reject', 1);
            } else {
                formData.reject = 0;
                userData.setUserData('reject', 0);
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

    //订阅前提醒先激活邮箱
    subscribeTips = () => {
        let content = '';
        if(!_.isEmpty(this.props.userInfo.email) && this.props.userInfo.emailEnable){
            //已激活可以订阅
            content = <a onClick={this.handleSubscribe}>
                <ReactIntl.FormattedMessage id="user.info.receive.subscribe" defaultMessage="重新订阅"/>
            </a>;
        }else{
            //没有邮箱
            let bind = Intl.get('apply.error.bind', '您还没有绑定邮箱，请先{bindEmail}',{bindEmail: Intl.get('apply.bind.email.tips','绑定邮箱')});
            //未激活邮箱
            let active = Intl.get('apply.error.active', '您还没有激活邮箱，请先{activeEmail}',{activeEmail: Intl.get('apply.active.email.tips', '激活邮箱')});
            content = <Popover
                overlayClassName="apply-invalid-popover"
                placement="topRight"
                trigger="click"
                content={
                    <span className="apply-error-tip">
                        <span className="iconfont icon-warn-icon"></span>
                        <span className="apply-error-text">
                            { _.isEmpty(this.props.userInfo.email) ? bind : active}
                        </span>
                    </span>
                }
            >
                <a>{Intl.get('user.info.receive.subscribe','重新订阅')}</a>
            </Popover>;
        }
        return(
            <ReactIntl.FormattedMessage
                id="user.info.receive.email"
                defaultMessage={'如果您想接受审批通知邮件提醒，可以{receive}'}
                values={{
                    'receive': content
                }}
            />
        );
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
                    {this.subscribeTips()}
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
        //将邮箱中激活链接的url传过去，以便区分https://ketao.antfact.com还是https://csm.curtao.com
        let bodyObj = {activate_url: getEmailActiveUrl()};
        UserInfoAction.activeUserEmail(bodyObj, (resultObj) => {
            if (resultObj.error) {
                message.error(resultObj.errorMsg);
            } else {
                this.setState({
                    sendMail: true,
                    closeMsg: false,
                });
                //暂存时间戳
                session.set('send_mail_start_time',new Date().getTime());
                this.sendMailTime();
            }
        });
    }

    //保存修改用户信息
    saveEditUserInfo = (type, saveObj, successFunc, errorFunc) => {
        let value = _.get(saveObj, type);
        let submitObj = {email: value};
        if (type === 'qq') {
            submitObj = {qq: _.trim(value)};
        }
        UserInfoAction.editUserInfo(submitObj, (errorMsg) => {
            if(_.isEmpty(errorMsg)){
                if (type === 'email') {
                    //邮箱修改成功，恢复为未激活
                    let formData = _.extend(this.state.formData, {emailEnable: false});
                    this.setState({
                        formData,
                        emailEditType: 'text'
                    });
                } else if (type === 'qq') {
                    this.setState({
                        qqEditType: 'text'
                    });
                }
                //在userdata中更新此字段
                userData.setUserData('email', value);
                userData.setUserData('emailEnable', false);
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


    // 设置qq编辑状态
    setQQEditable = () => {
        this.setState({
            qqEditType: 'edit'
        });
    }

    // 更新qq编辑状态
    onQQDisplayTypeChange = (type) => {
        this.setState({
            qqEditType: type
        });
    }
    //一分钟内不能重复发送邮件
    sendMailTime = () => {
        let close = () => {
            clearInterval(clock);
        };
        let clock = setInterval(() => {
            if(this.state.sendTime > 0){
                this.setState({
                    sendTime: this.state.sendTime - 1
                });
            }else{
                this.setState({
                    sendMail: false,
                    closeMsg: false,
                    sendTime: 60,
                });
                close();
            }
        },1000);
    }
    //页面刷新检查是否已发送邮件
    getSendTime = () => {
        if(session.get('send_mail_start_time')){
            let thisTime = new Date().getTime();
            if(thisTime - session.get('send_mail_start_time') > 60000){
                return null;
            }else{
                let surplusTime = 60 - Math.floor((thisTime - session.get('send_mail_start_time')) / 1000) || 0;
                this.setState({
                    sendMail: true,
                    sendTime: surplusTime,
                });
                this.sendMailTime();
            }
        }
    }
    //关闭邮件提示信息
    closeMailMsg = () => {
        this.setState({closeMsg: true});
    }
    //发送邮件后的提示
    sendMailMsg = () => {
        return(
            <div>
                <div className="hsaSendMailMsg">
                    <i className="iconfont icon-phone-call-out-tip"></i>
                    <span className="mailMsgContent">
                        {Intl.get('user.info.active.email.tip', '请根据邮件内步骤激活邮箱',{'email': _.get(this.props.userInfo, 'email')})}
                    </span>
                    <i className="iconfont icon-close-wide handle-btn-item" onClick={this.closeMailMsg}></i>
                </div>
            </div>
        );
    };

    handleUpdatePersonalVersion = (result) => {
        this.setState({
            versionName: _.get(result, 'version.type', this.state.versionName),
            endTime: _.get(result, 'end_time', this.state.endTime)
        });
    };
    // 处理版本升级
    handleVersionUpgrade = () => {
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, {
            continueFn: () => {
                history.push('/clue_customer');
            }
        });
    };

    saveEditLanguage = (saveObj, successFunc, errorFunc) => {
        UserInfoAjax.setUserLanguage(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.afterEditLangSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    };

    //判断是否为管理员
    isManager = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN); // 返回true，说明是管理员，否则是销售或运营
    };

    renderBtnBlock = () => {
        let currentVersion = checkCurrentVersion();
        let currentVersionType = checkCurrentVersionType();
        //个人试用提示升级，正式提示续费
        //企业试用提示升级，正式提示续费
        if(currentVersion.personal) {
            if(currentVersionType.trial) {//个人试用
                return (
                    <Button
                        className="user-version-upgrade"
                        onClick={this.handleVersionUpgrade}
                        data-tracename="点击升级为个人正式版按钮"
                    >
                        {Intl.get('user.info.version.upgrade', '升级为正式版')}
                    </Button>
                );
            }else if(currentVersionType.formal) {//个人正式
                return (
                    <Button
                        className="user-version-upgrade"
                        onClick={this.handleVersionUpgrade}
                        data-tracename="点击个人续费按钮"
                    >
                        {Intl.get('payment.renewal', '续费')}
                    </Button>
                );
            }
        }else if(currentVersion.company) {
            if(currentVersionType.trial) {//企业试用
                /*return (
                    <Popover
                        placement="right"
                        content={Intl.get('payment.please.contact.our.sale', '请联系我们的销售人员进行升级，联系方式：{contact}', {contact: '400-6978-520'})}
                        trigger='click'
                    >
                        <Button
                            className="user-version-upgrade"
                            data-tracename="点击升级为企业版按钮"
                        >
                            {Intl.get('personal.upgrade.to.enterprise.edition', '升级为企业版')}
                        </Button>
                    </Popover>
                );*/
                return null;
            }else if(currentVersionType.formal && this.isManager()) {//企业正式并且是管理员
                return (
                    <Popover
                        placement="right"
                        content={Intl.get('payment.please.contact.our.sale', '请联系我们的销售人员进行升级，联系方式：{contact}', {contact: '400-6978-520'})}
                        trigger='click'
                    >
                        <Button
                            className="user-version-upgrade"
                            data-tracename="点击企业续费按钮"
                        >
                            {Intl.get('payment.renewal', '续费')}
                        </Button>
                    </Popover>
                );
            }
        }
        return null;
    };

    renderUserInfo() {
        let formData = this.props.userInfo;
        //根据是否拥有邮箱改变渲染input默认文字
        let emailInputInfo = formData.email ? formData.email : '';
        //根据是否拥有邮箱改变编辑状态
        let isEditable = formData.email ? true : false;
        //根据邮箱状态是否激活改变渲染afterTextTip文字
        let displayInfo = !_.isEmpty(formData.email) ? (
            this.state.formData.emailEnable ? (
                <span className="active-info">
                    {Intl.get('common.actived', '已激活')}
                </span>) :
                (<span className="active-info">
                    <a onClick={this.activeUserEmail.bind(this)}>
                        {Intl.get('user.info.active.email.btn', '发送激活邮件',)}
                    </a>
                </span>)
        ) : null;
        //发送邮件后显示的计时器
        let afterSend = <span className ="hasSendMail" >
            {Intl.get('user.info.active.email.msg', '(已发送激活邮件{sendTime}s)',{sendTime: this.state.sendTime})}
        </span>;
        // 根据是否拥有qq改变渲染input默认文字
        let qqInputInfo = _.get(formData, 'qq', '');

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
                    <div className="user-info-item user-version">
                        <span className="user-info-item-title">
                            {Intl.get('user.info.version','版本')}：
                        </span>
                        <span className="user-info-item-content">
                            {this.state.versionName}
                        </span>
                        {
                            this.state.endTime ? (
                                <span className="user-version-expire">
                                    {`(${Intl.get('user.info.version.expire', '{time}到期', {time: moment(this.state.endTime).format(oplateConsts.DATE_FORMAT)})})`}
                                </span>
                            ) : null
                        }
                        {this.renderBtnBlock()}
                    </div>

                    <div className="user-info-item">
                        <span className="user-info-item-title">
                            <ReactIntl.FormattedMessage id="common.account.number" defaultMessage="账号"/>
                            ：</span>
                        <span className="user-info-item-content">{formData.userName}</span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-item-title">
                            {Intl.get('common.email', '邮箱')}
                            ：</span>
                        <span className="user-email-item user-info-item-content">
                            {_.isEmpty(formData.email) && !_.isEqual(this.state.emailEditType, 'edit') ? (<span>
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
                            </span>) : <BasicEditInputField
                                id={formData.id}
                                displayType={this.state.emailEditType}
                                field="email"
                                value={emailInputInfo}
                                hasEditPrivilege={!this.state.sendMail ? isEditable : false}
                                hoverShowEdit={false}
                                validators={[{
                                    pattern: emailRegex,
                                    message: Intl.get('common.correct.email', '请输入正确的邮箱')
                                }]}
                                afterTextTip={!this.state.sendMail ? displayInfo : afterSend}
                                saveEditInput={this.saveEditUserInfo.bind(this, 'email')}
                                onDisplayTypeChange={this.onEmailDisplayTypeChange}
                            />}
                        </span>
                    </div>
                    {this.state.sendMail && !this.state.closeMsg && this.state.sendTime > CLOSE_TIP_TIME ? this.sendMailMsg() : null}
                    <div className="user-info-item">
                        <span className="user-info-item-title">
                            {Intl.get('member.phone', '手机')}
                            ：</span>
                        <span className="user-info-item-content">
                            <PhoneShowEditField id={formData.id} phone={formData.phone}/>
                        </span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-item-title">QQ：</span>
                        <span className="user-qq-item user-info-item-content">
                            <BasicEditInputField
                                id={formData.id}
                                displayType={this.state.qqEditType}
                                field="qq"
                                value={qqInputInfo}
                                hasEditPrivilege={isEditable}
                                hoverShowEdit={false}
                                validators={[{validator: checkQQ}]}
                                placeholder={Intl.get('member.input.qq', '请输入QQ号')}
                                noDataTip={Intl.get('crm.contact.qq.none', '暂无QQ')}
                                addDataTip={Intl.get('crm.contact.qq.add', '添加QQ')}
                                saveEditInput={this.saveEditUserInfo.bind(this, 'qq')}
                                onDisplayTypeChange={this.onQQDisplayTypeChange}
                            />
                        </span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-item-title">{Intl.get('crm.58', '微信')}：</span>
                        <span className="user-info-item-content">
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
                        <span className="user-info-item-title">
                            <ReactIntl.FormattedMessage id="common.role" defaultMessage="角色"/>
                            ：</span>
                        <span className="user-info-item-content">{formData.rolesName}</span>
                    </div>
                    {hasPrivilege(privilegeConst_user_info.BASE_QUERY_PERMISSION_ORGANIZATION) ? (
                        <div className="user-info-item">
                            <span className="user-info-item-title">
                                <ReactIntl.FormattedMessage className="user-info-item-content" id="common.company" defaultMessage="公司"/>：
                            </span>
                            <span className="user-info-item-content">{this.props.managedRealm}</span>
                        </div>
                    ) : null}
                    { !Oplate.hideSomeItem && <div className="user-info-item">
                        <span className="user-info-item-title">{Intl.get('common.user.lang', '语言')}：</span>
                        <span className="user-lang-value user-info-item-content">
                            <BasicEditSelectField
                                id={formData.id}
                                displayText={this.getLangDisplayText()}
                                value={this.state.lang}
                                field="language"
                                selectOptions={this.getLangOptions()}
                                hasEditPrivilege={hasPrivilege(privilegeConst_user_info.CURTAO_USER_CONFIG)}
                                onSelectChange={this.onSelectLang.bind(this)}
                                cancelEditField={this.cancelEditLang.bind(this)}
                                saveEditSelect={this.saveEditLanguage}
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
                        <HeadIcon
                            headIcon={formData.userLogo}
                            iconDescr={formData.nickName}
                            isEdit={true}
                            onChange={this.uploadImg.bind(this)}
                            isNotShowUserName={true}
                            userName={formData.userName}
                            nickName={formData.nickName}
                            isUserHeadIcon={true}
                            isUseDefaultUserImage={true}
                        />
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
                    {
                        isCurtao() ? null : (
                            <PrivilegeChecker check={privilegeConst_user_info.CURTAO_USER_CONFIG}>
                                <div className="user-tips-div">
                                    <div className="user-tips-title-div">
                                        <div className="user-tips-name">
                                            {this.renderReceiveEmail()}
                                        </div>
                                    </div>
                                </div>
                            </PrivilegeChecker>
                        )
                    }
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
