var language = require("../../../../public/language/getLanguage");
require('PUB_DIR/css/card-info-common.less');
if (language.lan() == "es" || language.lan() == "en") {
    require('PUB_DIR/css/card-info-es.less');
}
import {Spin,Icon,Pagination,Form,Input,Tag,Alert} from "antd";
var FormItem = Form.Item;
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelEdit = rightPanelUtil.RightPanelEdit;
var RightPanelForbid = rightPanelUtil.RightPanelForbid;
var RightPanelVersionUpgrade = rightPanelUtil.RightPanelVersionUpgrade;
var RightPanelAppNotice = rightPanelUtil.RightPanelAppNotice;
var RightPanelUserTypeConfig = rightPanelUtil.RightPanelUserTypeConfig;
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;
var HeadIcon = require("../../../../components/headIcon");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var userData = require('../../../../public/sources/user-data');
var ModalDialog = require("../../../../components/ModalDialog");
var saveTimer = null;
import Trace from "LIB_DIR/trace";
var AppInfo = React.createClass({
    getInitialState: function() {
        return {
            appInfo: $.extend(true, {}, this.props.appInfo),
            appTagList: this.props.appTagList,
            modalStr: "",//模态框提示内容
            isDel: false,//是否删除
            isSaving: false,//正在保存标签
            //是否保存成功,error:失败，success:成功
            saveResult: "",
            //保存后的提示信息
            saveMsg: ""
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            appInfo: $.extend(true, {}, nextProps.appInfo),
            appTagList: nextProps.appTagList,
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
        if (this.props.showAddMemberButton) {
            formHeight -= 80;
        }
        $(".log-infor-scroll").height(formHeight);
    },
    showEditForm: function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击编辑应用按钮");
        this.props.showEditForm("edit");
    },
    showVersionUpgradePanel: function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击查看版本升级按钮");
        this.props.showVersionUpgradePanel();
    },
    showAppNoticePanel: function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击查看应用公告按钮");
        this.props.showAppNoticePanel();
    },
    //展示用户类型设置页面
    showUserTypeConfigPanel:function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击查看用户类型按钮");
        this.props.showUserTypeConfigPanel();
    },
    //展示是否禁用、启用的模态框
    showForbidModalDialog: function() {
        Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击启用/禁用应用按钮");
        var modalStr = Intl.get("member.start.this", "启用此");
        if (this.state.appInfo.status == 1) {
            modalStr = Intl.get("member.stop.this", "禁用此");
        }
        this.setState({modalStr: modalStr, isDel: false});
        this.props.showModalDialog();
    },
    forbidCard: function() {
        if (this.state.isDel) {
            this.props.deleteCard(this.props.appInfo.id);
        } else {
            var status = 1;
            if (this.props.appInfo.status == 1) {
                status = 0;
            }
            this.props.updateStatus(this.props.appInfo.id, status);
            Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击确认按钮");
        }
    },
    //按enter键添加标签
    addTag: function(e) {
        if (this.state.isSaving) return;
        if (e.keyCode !== 13) return;
        const tag = e.target.value.trim();
        Trace.traceEvent(e, '按enter键添加标签');
        if (!tag) return;
        this.toggleTag(tag, true);
        //清空输入框
        this.refs.newTag.refs.input.value = "";
    },
    //标签的选中与取消处理
    toggleTag: function(tag, isAdd) {
        if (this.state.isSaving) return;
        let tags = this.state.appInfo.tags || [];
        if (tags.indexOf(tag) > -1) {
            if (isAdd) return;
            Trace.traceEvent($(this.getDOMNode()).find(".block-tag-edit"),"点击取消标签");
            tags = tags.filter(theTag => theTag != tag);
        } else {
            if(!isAdd) {
                Trace.traceEvent($(this.getDOMNode()).find(".block-tag-edit"),"点击选中标签");
            }
            tags.push(tag);
            if (this.state.appTagList.indexOf(tag) === -1) {
                this.state.appTagList.push(tag);
            }
        }
        this.state.appInfo.tags = tags;
        var _this = this;
        this.setState({isSaving: true});
        //保存修改后的标签
        this.props.editAppTag({
            id: this.state.appInfo.id,
            tags: JSON.stringify(tags)
        }, function(result) {
            //保存后提示信息的处理
            _this.setState({
                isSaving: false,
                saveResult: result.saveResult,
                saveMsg: result.saveMsg
            });
            //保存成功后再修改
            if (result.saveResult == "success") {
                _this.setState({appInfo: _this.state.appInfo});
            }
            //3s后清空提示信息
            if (result.saveMsg || result.saveResult) {
                if (saveTimer) {
                    clearTimeout(saveTimer);
                    saveTimer = null;
                }
                saveTimer = setTimeout(function() {
                    _this.setState({
                        saveMsg: "",//保存组名的提示信息
                        saveResult: ""//修改组名时的保存结果
                    });
                }, 3000);
            }
        });
    },
    cancelEnter: function(e) {
        e.preventDefault();
    },
    //渲染标签列表
    renderAppTagList: function() {
        var selectedTagsArray = this.state.appInfo.tags || [];
        var appTagList = _.isArray(this.state.appTagList) ? this.state.appTagList : [];
        var unionTagsArray = _.union(appTagList, selectedTagsArray);
        var tagsJsx = "";
        if ( _.isArray(unionTagsArray) && unionTagsArray.length > 0) {
            var _this = this;
            tagsJsx = unionTagsArray.map(function(tag, index) {
                let className = "app-tag";
                className += selectedTagsArray.indexOf(tag) > -1 ? " tag-selected" : "";
                return (
                    <span key={index} onClick={() => _this.toggleTag(tag)} className={className}>{tag}</span>
                );
            });
        }
        return tagsJsx;
    },

    renderAddTagsInput(){
        return (
            <div>
                <Input placeholder={Intl.get("app.tag.placeholder", "按Enter键添加新标签")} ref="newTag"
                    onKeyUp={this.addTag}
                />
                {this.state.isSaving ? (
                    <div className="app-tag-saving">{Intl.get("app.add.tag", "正在添加标签...")} </div>) : ""}
                {(!this.state.isSaving && this.state.saveResult) ? (
                    <div className={"app-tag-save-"+this.state.saveResult}>
                        {this.state.saveMsg}
                    </div>) : ""}
            </div>
        );

    },
    //渲染应用信息
    renderAppItems: function() {
        let appInfo = this.state.appInfo;
        var managers = Intl.get("app.app.no.managers", "暂无管理员");
        if (_.isArray(appInfo.managers)) {
            //应用详情中展示管理员姓名
            managers = _.pluck(appInfo.managers, "managerName");
            managers = managers.join(',') || Intl.get("app.app.no.managers", "暂无管理员");
        }
        let realmId = userData.getUserData().auth.realm_id || "";
        var createDate = appInfo.createDate ? moment(appInfo.createDate).format(oplateConsts.DATE_FORMAT) : "";
        var expireDate = appInfo.expireDate ? moment(appInfo.expireDate).format(oplateConsts.DATE_FORMAT) : "";
        return (<div>
            <div className="card-item">
                <span className="card-item-left"> URL:</span>
                <span className="card-item-right" title={appInfo.appUrl}>
                    {appInfo.appUrl}
                </span>
            </div>
            <div className="card-item">
                <span className="card-item-left"> ID:</span>
                <span className="card-item-right" title={appInfo.id}>
                    {appInfo.id}
                </span>
            </div>
            <div className="card-item">
                <span className="card-item-left"><ReactIntl.FormattedMessage id="common.owner"
                    description="所有者"/>:</span>
                <span className="card-item-right" title={appInfo.ownerName}>
                    {appInfo.ownerName}
                </span>
            </div>
            <div className="card-item">
                <span className="card-item-left"><ReactIntl.FormattedMessage id="common.managers"
                    description="管理员"/>:</span>
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
                <span className="card-item-left"><ReactIntl.FormattedMessage id="common.realm.id" defaultMessage="安全域ID"/>:</span>
                <span className="card-item-right" title={realmId}>
                    {realmId}
                </span>
            </div>
            <div className="card-item">
                {language.lan() == 'zh' || language.lan() == 'en' ? (
                    <span>
                        <span className="card-item-left"><ReactIntl.FormattedMessage id="common.captcha"
                            defaultMessage="验证码"/>:</span>
                        <span className="card-item-right">
                            {Intl.get("secret.error", "密码输错") + "["  +(appInfo.captchaTime || " ")  + "]" + Intl.get("show.captcha", "次，出现验证码")}
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
                        {Intl.get("secret.error", "密码输错") + "["  +(appInfo.captchaTime || " ")  + "]" + Intl.get("show.captcha", "次，出现验证码")}
                    </span>
                </div>
            ) : null}

            <div className="card-item left-label-null-style">
                <span className="card-item-left">   </span>
                <span className="card-item-right">
                    {Intl.get("session.overclock", "session超频") + "["  +(appInfo.sessionCaptcha || " ")  + "]" + Intl.get("show.captcha", "次，出现验证码")}
                </span>
            </div>
            <div className="card-item left-label-null-style">
                <span className="card-item-left">   </span>
                <span className="card-item-right">
                    {Intl.get("ip.overclock", "IP超频") + "["  +(appInfo.ipCaptcha || " ")  + "]" + Intl.get("show.captcha", "次，出现验证码")}
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
                    className="card-item-left"> {createDate}
                    {Intl.get("common.time.connector", "至")}{expireDate}</span>
            </div>
        </div>);
    },
    closeRightPanel(e) {
        Trace.traceEvent(e,"关闭应用详情界面");
        this.props.closeRightPanel();
    },
    render: function() {
        //当前要展示的信息
        var appInfo = this.state.appInfo;
        var modalContent = Intl.get("member.is.or.not","是否{modalStr}{modalType}",{
            "modalStr":this.state.modalStr,
            "modalType":this.props.modalType
        });
        var className = "right-panel-content";
        if (!this.props.appInfoShow) {
            if (this.props.appFormShow ||
                    this.props.versionUpgradeShow ||
                    this.props.isAppAuthPanelShow ||
                    this.props.isAppNoticePanelShow ||
                    this.props.userTypeConfigShow
            ) {
                //展示form面板时，整体左移
                className += " right-panel-content-slide";
            }
        }

        var userName = this.state.appInfo.userName ? this.state.appInfo.userName.value : "";
        let labelCol = (language.lan() == 'zh' ? 3 : 4);
        return (
            <div className={className} data-tracename="查看应用详情">
                <RightPanelClose onClick={this.closeRightPanel}/>
                <div className="edit-buttons">
                    <PrivilegeChecker check={"APP_MANAGE_EDIT_APP"}>
                        <RightPanelEdit onClick={this.showEditForm}/>
                        <RightPanelForbid onClick={this.showForbidModalDialog}
                            isActive={this.state.appInfo.status==0}/>
                    </PrivilegeChecker>
                    {/**v8环境，不显示系统公告、版本升级记录、用户类型设置*/}
                    { !Oplate.hideSomeItem &&
                        <PrivilegeChecker check={"GET_APPLICATION_RECORD" || "ADD_APPLICATION_RECORD"}>
                            <RightPanelVersionUpgrade onClick={this.showVersionUpgradePanel}/>
                        </PrivilegeChecker>}
                    { !Oplate.hideSomeItem &&
                        <PrivilegeChecker check={"GET_APPLICATION_NOTICE" || "ADD_APPLICATION_NOTICE"}>
                            <RightPanelAppNotice onClick={this.showAppNoticePanel}/>
                        </PrivilegeChecker>}
                    { !Oplate.hideSomeItem &&
                        <PrivilegeChecker check={"GET_APP_EXTRA_GRANTS"}>
                            <RightPanelUserTypeConfig  onClick={this.showUserTypeConfigPanel}/>
                        </PrivilegeChecker> }
                </div>
                <HeadIcon headIcon={this.state.appInfo.image} iconDescr={this.state.appInfo.name}
                    userName={userName}
                    isUserHeadIcon={true}
                />
                <div className="log-infor-scroll">
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
                        {this.props.appTagList && hasPrivilege("APP_MANAGE_EDIT_APP")? (
                            <Form horizontal className="card-info-tag-form" autoComplete="off"
                                onSubmit={this.cancelEnter}>
                                <FormItem
                                    label={Intl.get("common.tag", "标签") + ": "}
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 21}}
                                >
                                    <div className="block-tag-edit">
                                        {this.renderAppTagList()}
                                    </div>
                                    <div>
                                        {this.renderAddTagsInput()}
                                    </div>
                                </FormItem></Form>) : ""
                        }
                    </GeminiScrollbar>
                </div>
                <ModalDialog modalContent={modalContent}
                    modalShow={this.props.modalDialogShow}
                    container={this}
                    hideModalDialog={this.props.hideModalDialog}
                    delete={this.forbidCard}
                />
            </div>
        );
    }
})
    ;

module.exports = AppInfo;
