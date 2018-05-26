/**
 * Created by wangliping on 2017/2/25.
 */
var language = require("../../../../public/language/getLanguage");
require('PUB_DIR/css/card-info-common.less');
if (language.lan() == "es" || language.lan() == "en") {
    require('PUB_DIR/css/card-info-es.less');
}
import {Spin,Icon,Pagination,Form,Input,Tag,Alert,DatePicker,message,Popconfirm} from "antd";
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelEdit = rightPanelUtil.RightPanelEdit;
var RightPanelVersionUpgrade = rightPanelUtil.RightPanelVersionUpgrade;
var RightPanelAppAuth = rightPanelUtil.RightPanelAppAuth;
var RightPanelAppNotice = rightPanelUtil.RightPanelAppNotice;
var RightPanelUserTypeConfig = rightPanelUtil.RightPanelUserTypeConfig;
var RightPanelAppCodeTrace = rightPanelUtil.RightPanelAppCodeTrace;
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;
var HeadIcon = require("../../../../components/headIcon");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var userData = require("../../../../public/sources/user-data");
let AppAction = require("../action/app-actions");
const FORMAT = oplateConsts.DATE_FORMAT;
import Trace from "LIB_DIR/trace";
var AppInfo = React.createClass({
    getInitialState: function() {
        return {
            appInfo: $.extend(true, {}, this.props.appInfo),
            isSaving: false,//正在保存到期时间
            isEditExpireDate: false,//是否在编辑应用到期时间
            expireDate: this.props.appInfo.expireDate || ""//应用到期时间
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            appInfo: $.extend(true, {}, nextProps.appInfo),
            isEditExpireDate: false,
            expireDate: nextProps.appInfo.expireDate || ""
        });
        this.layout();
    },
    componentDidMount: function() {
        var _this = this;
        _this.layout();
        $(window).resize(function(e) {
            e.stopPropagation();
            _this.layout();
        });
    },
    layout: function() {
        var bHeight = $("body").height();
        var formHeight = bHeight - $(".head-image-container").outerHeight(true);
        $(".app-infor-scroll").height(formHeight);
    },
    showEditForm: function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击编辑应用界面");
        this.props.showEditForm("edit");
    },
    showVersionUpgradePanel: function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击查看升级记录");
        this.props.showVersionUpgradePanel();
    },
    showAppNoticePanel: function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击查看公告");
        this.props.showAppNoticePanel();
    },
    //展示用户类型设置页面
    showUserTypeConfigPanel: function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击查看用户类型");
        this.props.showUserTypeConfigPanel();
    },
    //到期时间的修改
    showAppCodeTrace: function() {
        this.props.showAppCodeTrace();
    },
    //到期时间的修改
    expireDateChange: function(field, value) {
        let expireDate = value.valueOf();
        this.setState({expireDate: expireDate});
    },
    confirm: function() {
        this.props.refreshAppSecret();
    },
    //渲染应用信息
    renderAppItems: function() {
        var _this = this;
        let appInfo = this.state.appInfo;
        var tags = "";
        if (_.isArray(appInfo.tags) && appInfo.tags.length) {
            tags = appInfo.tags.map(function(tag, index) {
                return (<Tag key={index}>{tag}</Tag>);
            });
        }
        var managers = Intl.get("app.app.no.managers", "暂无管理员");
        if (_.isArray(appInfo.managers)) {
            //应用详情中展示管理员姓名
            managers = _.pluck(appInfo.managers, "managerName");
            managers = managers.join(',') || Intl.get("app.app.no.managers", "暂无管理员");
        }
        let realmId = userData.getUserData().auth.realm_id || "";

        let disabledDate = function(current) {
            //应用到期时间的选择不能小于当前时间
            return current && current.valueOf() < Date.now();
        };

        let expireDate = this.state.expireDate ? moment(this.state.expireDate).format(FORMAT) : "";

        let expireDateMoment = this.state.expireDate ? moment(this.state.expireDate) : moment();
        return (<div>
            <div className="card-item">
                <span className="card-item-left"> URL: </span>
                <span className="card-item-right" title={appInfo.appUrl}>
                    {appInfo.appUrl}
                </span>
            </div>
            <div className="tag-container" key="tag">
                <div className="tag-label"><ReactIntl.FormattedMessage id="common.tag" defaultMessage="标签"/>:</div>
                <div className="block-tag"> {tags} </div>
            </div>
            <div className="card-item">
                <span className="card-item-left"> ID:</span>
                <span className="card-item-right" title={appInfo.id}>
                    {appInfo.id}
                </span>
            </div>
            <div className="card-item">
                <span className="card-item-left"><ReactIntl.FormattedMessage id="common.managers"
                    defaultMessage="管理员"/>:</span>
                <span className="card-item-right" title={managers}>
                    {managers}
                </span>
            </div>
            <div className="card-item">
                <span className="card-item-left"><ReactIntl.FormattedMessage id="common.secret.app"
                    defaultMessage="密令APP"/>:</span>
                <span className="card-item-right" title={appInfo.secretAppName}>
                    {appInfo.secretAppName}
                </span>
            </div>
            <div className="card-item">
                <span className="card-item-left"><ReactIntl.FormattedMessage id="my.app.app.secret.key"
                    defaultMessage="密钥"/>:</span>
                <span className="card-item-right" title={_.isArray(appInfo.appSecret) && (appInfo.appSecret).join('') || appInfo.appSecret}>
                    {appInfo.appSecret}
                </span>
                <i></i>
                {hasPrivilege("REFRESH_SECRET") ? (
                    <Popconfirm title={Intl.get("my.app.app.secret.modal.content", "确定要刷新密钥吗？")}
                        onConfirm={_this.confirm}
                        okText={Intl.get("common.sure", "确认")}
                        cancelText={Intl.get("common.cancel", "取消")}
                    >

                        <a className="refresh-app-secret">
                            {Intl.get("common.refresh", "刷新")}  {this.props.appSecretRefreshing ? (<Icon type="loading"/>) : null}
                        </a>
                    </Popconfirm>) : null}

            </div>
            <div className="card-item">
                <span className="card-item-left"><ReactIntl.FormattedMessage id="common.realm.id" defaultMessage="安全域ID"/>:</span>
                <span className="card-item-right" title={realmId}>
                    {realmId}
                </span>
            </div>
            <div className="card-item">
                <span className="card-item-left"><ReactIntl.FormattedMessage id="common.status"
                    defaultMessage="状态"/>:</span>
                <span className="card-item-right">
                    {appInfo.status ? Intl.get("common.enabled", "启用") : Intl.get("common.disabled", "禁用")}
                </span>
            </div>
            <div className="card-item">
                {language.lan() == 'zh' || language.lan() == 'en' ? (
                    <span>
                        <span className="card-item-left"><ReactIntl.FormattedMessage id="common.captcha"
                            defaultMessage="验证码"/>:</span>
                        <span className="card-item-right">
                            {Intl.get("secret.error", "密码输错") + "[" + (appInfo.captchaTime || " ") + "]" + Intl.get("show.captcha", "次，出现验证码")}
                        </span>
                    </span>

                ) : (
                    <div className="card-item-left"><ReactIntl.FormattedMessage id="common.captcha"
                        defaultMessage="验证码"/>:</div>
                )}
            </div>
            {language.lan() == 'es' ? (
                <div className="card-item left-label-null-style">
                    <span className="card-item-right">
                        {Intl.get("secret.error", "密码输错") + "[" + (appInfo.captchaTime || " ") + "]" + Intl.get("show.captcha", "次，出现验证码")}
                    </span>
                </div>
            ) : null}

            <div className="card-item left-label-null-style">
                <span className="card-item-left">   </span>
                <span className="card-item-right">
                    {Intl.get("session.overclock", "session超频") + "[" + (appInfo.sessionCaptcha || " ") + "]" + Intl.get("show.captcha", "次，出现验证码")}
                </span>
            </div>
            <div className="card-item left-label-null-style">
                <span className="card-item-left">   </span>
                <span className="card-item-right">
                    {Intl.get("ip.overclock", "IP超频") + "[" + (appInfo.ipCaptcha || " ") + "]" + Intl.get("show.captcha", "次，出现验证码")}
                </span>
            </div>
            <div className="card-item">
                <span className="card-item-left"><ReactIntl.FormattedMessage id="common.describe"
                    defaultMessage="描述"/>:</span>
                <span className="card-item-right" title={appInfo.descr}>
                    {appInfo.descr}
                </span>
            </div>
            <div className="card-item">
                <span
                    className="card-item-left"> {appInfo.createDate ? moment(appInfo.createDate).format(FORMAT) : ""}
                        &nbsp;&nbsp;{Intl.get("common.time.connector", "至")}&nbsp;&nbsp;</span>
                <span className="card-item-right">
                    {this.state.isEditExpireDate ? (<span>
                        <DatePicker placeholder={Intl.get("my.app.change.expire.time.placeholder", "请选择到期时间")}
                            value={expireDateMoment}
                            disabledDate={disabledDate}
                            onChange={this.expireDateChange.bind(this,'expireDate')}/>
                        {this.state.isSaving ? <Icon className="saving-expire-date-icon" type="loading"/> : (<span>
                            <i title={Intl.get("common.save", "保存")}
                                className="save-expire-date-icon iconfont icon-choose"
                                onClick={this.handleSubmit}/>
                            <i title={Intl.get("common.cancel", "取消")}
                                className="cancel-save-expire-date-icon iconfont icon-close"
                                onClick={this.setEditExpireDateFlag.bind(this,false)}/>
                        </span>)}
                    </span>) : (<span>{expireDate ? expireDate : "-"}
                        {hasPrivilege("UPDATE_APPLICATION_EXPIREDATE") ? (
                            <i className="iconfont icon-update update-expire-date"
                                title={Intl.get("my.app.change.expire.time", "修改到期时间")}
                                onClick={this.setEditExpireDateFlag.bind(this,true)}/>) : null}
                    </span>) }
                </span>
            </div>
        </div>);
    },
    //修改到期时间的处理
    handleSubmit: function() {
        if (this.state.expireDate != this.props.appInfo.expireDate) {
            Trace.traceEvent($(this.getDOMNode()).find(".save-expire-date-icon"),"保存修改应用的到期时间");
            //如果有修改则进行保存
            let submitData = {
                client_id: this.props.appInfo.id,
                expire_date: this.state.expireDate
            };
            this.setState({isSaving: true});
            AppAction.updateAppExpireDate(submitData, data => {
                if (_.isObject(data) && data.error) {
                    //修改失败
                    this.setState({isSaving: false});
                    message.error(data.errorMsg);
                } else {
                    //修改成功
                    this.setState({isSaving: false, isEditExpireDate: false});
                    AppAction.afterUpdateAppExpireDate(submitData);
                }
            });
        } else {
            //没有修改，则直接返回到展示状态
            this.setState({isEditExpireDate: false});
        }
    },
    setEditExpireDateFlag: function(flag) {
        if (flag) {
            Trace.traceEvent($(this.getDOMNode()).find(".update-expire-date"),"修改应用的到期时间");
            this.setState({isEditExpireDate: flag});
        } else {
            Trace.traceEvent($(this.getDOMNode()).find(".cancel-save-expire-date-icon"),"取消修改应用的到期时间");
            this.setState({isEditExpireDate: flag, expireDate: this.props.appInfo.expireDate || ""});
        }
    },
    render: function() {
        var className = "right-panel-content";
        if (!this.props.appInfoShow) {
            if (this.props.appFormShow ||
                this.props.versionUpgradeShow ||
                this.props.isAppAuthPanelShow ||
                this.props.isAppNoticePanelShow ||
                this.props.userTypeConfigShow ||
                this.props.appCodeTraceShow
            ) {
                //展示form面板时，整体左移
                className += " right-panel-content-slide";
            }
        }
        return (
            <div className={className}>
                <RightPanelClose onClick={this.props.closeRightPanel}/>
                <div className="edit-buttons">
                    <PrivilegeChecker check="USER_INFO_MYAPP_EDIT">
                        <RightPanelEdit onClick={this.showEditForm}/>
                        <RightPanelAppAuth onClick={this.props.showAppAuthPanel}/>
                    </PrivilegeChecker>
                    {/**v8环境，不显示系统公告、版本升级记录、用户类型设置、应用跟踪代码*/}
                    { !Oplate.hideSomeItem &&
                    <PrivilegeChecker check={"GET_APPLICATION_RECORD" || "ADD_APPLICATION_RECORD"}>
                        <RightPanelVersionUpgrade onClick={this.showVersionUpgradePanel}/>
                    </PrivilegeChecker> }
                    { !Oplate.hideSomeItem &&
                    <PrivilegeChecker check={"GET_APPLICATION_NOTICE" || "ADD_APPLICATION_NOTICE"}>
                        <RightPanelAppNotice onClick={this.showAppNoticePanel}/>
                    </PrivilegeChecker> }
                    { !Oplate.hideSomeItem &&
                    <PrivilegeChecker check={"GET_APP_EXTRA_GRANTS"}>
                        <RightPanelUserTypeConfig onClick={this.showUserTypeConfigPanel}/>
                    </PrivilegeChecker> }
                    { !Oplate.hideSomeItem &&
                    <PrivilegeChecker check={"GENERATE_PIWIK_KEY"}>
                        <RightPanelAppCodeTrace onClick={this.showAppCodeTrace}/>
                    </PrivilegeChecker>}
                </div>
                <HeadIcon headIcon={this.state.appInfo.image} iconDescr={this.state.appInfo.name}
                    isUserHeadIcon={true}
                />
                <div className="app-infor-scroll">
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <div className="card-infor-list">
                            {this.props.getAppDetailError ? (<div className="card-detail-error">
                                <Alert message={this.props.getAppDetailError}
                                    type="error" showIcon/>
                            </div>) : null}
                            {this.props.infoIsloading ? (
                                <Spin size="small"/>) : this.renderAppItems()
                            }
                        </div>
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});

module.exports = AppInfo;
