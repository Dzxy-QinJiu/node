require("../../../components/app-notice/app-notice-list.scss");
var language = require("../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./scss/index-es_VE.scss");
}else if (language.lan() == "zh"){
    require("./scss/index-zh_CN.scss");
}
var RightContent = require("../../../components/privilege/right-content");
var RightCardsContainer = require("../../../components/rightCardsContainer");
var rightPanelUtil = require("../../../components/rightPanel");
var RightPanel = rightPanelUtil.RightPanel;
var EditAppForm = require("./views/app-form");
var VersionUpgradeLog = require('./views/version-upgrade-log');
var AppNotice = require('./views/app-notice');
var AppInfo = require("./views/app-info");
var MyAppAuthRoleView = require("./views/auth-role-view");
var AppAuthPanel = require("./views/app-auth-panel");
var AppStore = require("./store/app-store");
var AppAction = require("./action/app-actions");
var AppFormAction = require("./action/app-form-actions");
var UserTypeConfig = require('./views/user-type-config');
var Spinner = require("../../../components/spinner");
var classNames = require("classnames");
var openTimeout = null;//打开面板时的时间延迟设置
var focusTimeout = null;//focus事件的时间延迟设置
var AppCodeTrace = require('./views/app-code-trace');

import Trace from "LIB_DIR/trace";
//我的应用的自定义事件处理
var myAppEmitter = require("../../../public/sources/utils/emitters").myAppEmitter;
const FORMAT = oplateConsts.DATE_FORMAT;
//构造搜索条件,搜索关键字：应用名、描述
function constructorSearchObj(searchContent) {
    if (searchContent) {
        searchContent = JSON.stringify({
            clientName: searchContent,
            clientDesc: searchContent
        });
    }
    return searchContent;
}
var MyAppManage = React.createClass({
    getInitialState: function () {
        return AppStore.getState();
    },
    onChange: function () {
        this.setState(AppStore.getState());
    },
    componentDidMount: function () {
        $("body").css("overflow", "hidden");
        AppStore.listen(this.onChange);
        //通过history.pushState({params}，“/myApp”,{urlParams});跳转过来时，params参数
        var locationState = this.props.location.state;
        if (locationState) {
            //获取添加用户时，需设置角色权限的应用的id(从添加用户面板转过来时的处理)
            var appId = locationState.appId;
            var showType = locationState.type;//role/authority展示角色还是权限
            if (appId) {
                AppAction.showAuthRolePanel(appId);
            }
            if (showType) {
                AppAction.setShowRoleAuthType(showType);
            }
        }
        myAppEmitter.on(myAppEmitter.GO_TO_ADD_ROLE, this.goToAddRole);
        myAppEmitter.on(myAppEmitter.GO_TO_ADD_PERMISSION, this.goToAddPermission);
    },
    //去设置角色
    goToAddRole: function (appId) {
        if (appId) {
            AppAction.showAuthRolePanel(appId);
            AppAction.setShowRoleAuthType('role');
        }
    },
    //去设置角色
    goToAddPermission: function (appId) {
        if (appId) {
            AppAction.showAuthRolePanel(appId);
            AppAction.setShowRoleAuthType('authority');
        }
    },
    componentWillUnmount: function () {
        $("body").css("overflow", "auto");
        AppStore.unlisten(this.onChange);
        myAppEmitter.removeListener(myAppEmitter.GO_TO_ADD_ROLE, this.goToAddRole);
        myAppEmitter.removeListener(myAppEmitter.GO_TO_ADD_PERMISSION, this.goToAddPermission);
    },
    events: {
        showAppForm: function (type) {
            AppFormAction.setManagerListLoading(true);
            AppFormAction.getAppManagerList();
            AppFormAction.setAllAppListLoading(true);
            AppFormAction.getAllAppList();
            //type：“edit”/"add"
            if (type === "add") {
                if (focusTimeout) {
                    clearTimeout(focusTimeout);
                }
                focusTimeout = setTimeout(function () {
                    $("#name").focus();
                }, 600);
            }
            AppAction.showAppForm(type);
        },
        // 版本升级记录
        showVersionUpgradePanel: function () {
            AppAction.showVersionUpgradePanel();
        },

        // 系统公告
        showAppNoticePanel: function () {
            AppAction.showAppNoticePanel();
        },
        //用户类型设置
        showUserTypeConfigPanel: function () {
            AppAction.showUserTypeConfigPanel();
        },
        //status:0->停用、1->启用
        updateAppStatus: function (appId, status) {
            AppAction.updateAppStatus({id: appId, status: status});
        },

        //切换页数时，当前页展示数据的修改
        onChangePage: function (count, curPage) {
            AppAction.updateCurPage(curPage);
            var searchObj = {
                cur_page: curPage,
                page_size: count,
                search_content: constructorSearchObj(this.state.searchContent)
            };
            AppAction.getMyAppList(searchObj);
        },
        //展示模态框
        showModalDialog: function () {
            AppAction.showModalDialog();
        },
        //隐藏模态框
        hideModalDialog: function () {
            AppAction.hideModalDialog();
        },
        //应用代码跟踪
        showAppCodeTrace:function () {
            AppAction.showAppCodeTrace();
        },

        showAppInfo: function (app) {
            //正在获取其他应用详情，则先不展示当前应用详情
            if (this.state.appIsLoading) {
                return;
            }
            AppAction.setCurAppDetail(app.id);
            setTimeout(function () {
                //获取应用的详情
                AppAction.getCurAppById(app.id);
            });
            if ($(".right-panel-content").hasClass("right-panel-content-slide")) {
                if (!this.state.versionUpgradeShow && !this.state.appNoticePanelShow && !this.state.userTypeConfigShow && !this.state.appCodeTraceShow) {
                    $(".right-panel-content").removeClass("right-panel-content-slide");
                    if (openTimeout) {
                        clearTimeout(openTimeout);
                    }
                    openTimeout = setTimeout(function () {
                        AppAction.showAppInfo();
                    }, 200);
                }
            } else {
                AppAction.showAppInfo();
            }
        },
        searchEvent: function (searchContent) {
            AppAction.updateCurPage(1);
            AppAction.updateSearchContent(searchContent);
            var searchObj = {
                cur_page: 1,
                page_size: this.state.pageSize,
                search_content: constructorSearchObj(searchContent)
            };
            AppAction.getMyAppList(searchObj);
        },
        //右侧面板的关闭
        closeRightPanel: function () {
            AppAction.closeRightPanel();
        },

        closeDetailRightPanel(e) {
            e.stopPropagation();
            Trace.traceEvent(e,"关闭应用详情界面");
            AppAction.closeRightPanel();
        },

        //由编辑页面返回信息展示页面
        returnInfoPanel: function () {
            AppAction.returnInfoPanel();
        },
        //一页展示多少应用的修改
        updatePageSize: function (count) {
            AppAction.updatePageSize(count);
        },
        showAuthRolePanel: function (app) {
            AppAction.showAuthRolePanel(app.id);
        },
        closeAuthRolePanel: function (event) {
            Trace.traceEvent(event,"关闭角色和权限界面");
            AppAction.closeAuthRolePanel();
        },
        setShowRoleAuthType: function (type) {
            AppAction.setShowRoleAuthType(type);
        },
        showAppAuthPanel: function (event) {
            Trace.traceEvent(event,"点击查看应用权限");
            AppAction.showAppAuthPanel();
        },
        //刷新应用密钥
        refreshAppSecret: function () {
            //刷新应用密钥
            AppAction.setAppSecretRefreshing(true);
            AppAction.refreshAppSecret(this.state.currentApp.id);
        }
    },

    renderRightPanel: function () {
        if (this.state.isAppFormShow) {
            return (
                <EditAppForm
                    closeRightPanel={this.events.closeRightPanel}
                    returnInfoPanel={this.events.returnInfoPanel}
                    formType={this.state.formType}
                    app={this.state.currentApp}
                    //显示点击card时右侧内容
                    appFormShow={this.state.appFormShow}
                    userList={this.state.userList}
                    appList={this.state.allAppList}
                />
            )
        } else if (this.state.isAppAuthPanelShow) {
            return (
                <AppAuthPanel closeRightPanel={this.events.closeRightPanel}
                              returnInfoPanel={this.events.returnInfoPanel}
                              appAuthPanelShow={this.state.appAuthPanelShow}
                              appAuthMap={this.state.currentApp.appAuthMap}
                              appId={this.state.currentApp.id}
                />
            )
        } else if (this.state.isAppNoticePanelShow) {
            return (
                <AppNotice
                    closeRightPanel={this.events.closeRightPanel}
                    returnInfoPanel={this.events.returnInfoPanel}
                    appNoticePanelShow={this.state.appNoticePanelShow}
                    appId={this.state.currentApp.id}
                />
            )
        } else if (this.state.versionUpgradeShow) {
            return (
                <VersionUpgradeLog
                    closeRightPanel={this.events.closeRightPanel}
                    returnInfoPanel={this.events.returnInfoPanel}
                    versionUpgradeShow={this.state.versionUpgradeShow}
                    appId={this.state.currentApp.id}
                />
            )
        } else if (this.state.userTypeConfigShow) {
            return (
                <UserTypeConfig
                    closeRightPanel={this.events.closeRightPanel}
                    returnInfoPanel={this.events.returnInfoPanel}
                    userTypeConfigShow={this.state.userTypeConfigShow}
                    appId={this.state.currentApp.id}
                    appName={this.state.currentApp.name}

                />

            )

        }else if (this.state.appCodeTraceShow){
            return (
                <AppCodeTrace
                    closeRightPanel={this.events.closeRightPanel}
                    returnInfoPanel={this.events.returnInfoPanel}
                    appId={this.state.currentApp.id}
                    appName={this.state.currentApp.name}
                    appCodeTraceShow={this.state.appCodeTraceShow}
                />
            )
        }
    },
    //获取卡片展示所需的应用列表
    getCardShowAppList: function () {
        let appList = _.isArray(this.state.curAppList) ? this.state.curAppList : [];
        return appList.map(app=> {
            let pageApp = {
                id: app.id,
                name: app.name,
                image: app.image,
                appUrl: {
                    label: "URL:",
                    value: app.appUrl,
                    showOnCard: true
                },
                status: app.status,
                descr: {
                    label: Intl.get("common.describe", "描述") + ':',
                    value: app.descr,
                    showOnCard: true
                },
                appAuthMap: app.appAuthMap
            };
            var createDate = app.createDate ? moment(app.createDate).format(FORMAT) : "";
            var expireDate = app.expireDate ? moment(app.expireDate).format(FORMAT) : "";
            if (expireDate) {
                pageApp.date = {
                    label: createDate +Intl.get("common.time.connector", " 至") + expireDate,
                    value: "",
                    showOnCard: true
                };
            } else {
                pageApp.date = {
                    label: createDate + Intl.get("common.time.connector", " 至 -"),
                    value: "",
                    showOnCard: true
                }
            }
            return pageApp;
        });

    },
    render: function () {
        var modalType = Intl.get("common.app", "应用");
        var authRoleView = null;
        var firstLoading = this.state.isLoading;
        if (this.state.isShowAuthRolePanel) {
            authRoleView = (<MyAppAuthRoleView curAppId={this.state.showAuthoRoleAppId}
                                               showRoleAuthType={this.state.showRoleAuthType}
                                               setShowRoleAuthType={this.events.setShowRoleAuthType}
                                               closeAuthRolePanel={this.events.closeAuthRolePanel}/>);
        }
        var _this = this;
        var slideClassName = classNames("right-panel-content", {
            "right-panel-content-slide": (
                _this.state.appFormShow ||
                _this.state.appAuthPanelShow ||
                _this.state.versionUpgradeShow ||
                _this.state.appNoticePanelShow ||
                _this.state.userTypeConfigShow ||
                _this.state.appCodeTraceShow

            )
        });
        return (
            <div className="my_app_manage_style" >
                {
                    (firstLoading && this.state.isShowAuthRolePanel == false) ? <div className="firstLoading">
                        <Spinner />
                    </div> : null
                }
                <RightContent>
                    <div className="myApp_content" data-tracename="我的应用">
                        <RightCardsContainer
                            currentCard={this.state.currentApp}
                            cardListSize={this.state.appListSize}
                            curCardList={this.getCardShowAppList()}
                            selectCards={this.state.selectApps}
                            listTipMsg={this.state.appListTipMsg}
                            curPage={this.state.curPage}
                            pageSize={this.state.pageSize}
                            updatePageSize={this.events.updatePageSize.bind(this)}
                            showCardForm={this.events.showAppForm}
                            hideCardForm={this.events.hideAppForm}
                            submitCardForm={this.events.submitAppForm}
                            editCard={this.events.editApp}
                            changePageEvent={this.events.onChangePage.bind(this)}
                            showCardInfo={this.events.showAppInfo.bind(this)}
                            showRightFullScreen={this.events.showAuthRolePanel}
                            modalType={modalType}
                            type="myApp"
                        >
                            <RightPanel className="white-space-nowrap" showFlag={this.state.rightPanelShow} data-tracename="查看应用详情">
                                <AppInfo
                                    appInfo={this.state.currentApp}
                                    appInfoShow={this.state.appInfoShow}
                                    appFormShow={this.state.appFormShow}
                                    versionUpgradeShow={this.state.versionUpgradeShow}
                                    userTypeConfigShow={this.state.userTypeConfigShow}
                                    isAppAuthPanelShow={this.state.appAuthPanelShow}
                                    isAppNoticePanelShow={this.state.appNoticePanelShow}
                                    appCodeTraceShow={this.state.appCodeTraceShow}
                                    infoIsloading={this.state.appIsLoading}
                                    showEditForm={this.events.showAppForm}
                                    showVersionUpgradePanel={this.events.showVersionUpgradePanel}
                                    showUserTypeConfigPanel={this.events.showUserTypeConfigPanel}
                                    showAppCodeTrace={this.events.showAppCodeTrace}
                                    updateStatus={this.events.updateAppStatus}
                                    closeRightPanel={this.events.closeDetailRightPanel}
                                    showAppAuthPanel={this.events.showAppAuthPanel}
                                    showAppNoticePanel={this.events.showAppNoticePanel}
                                    refreshAppSecret={this.events.refreshAppSecret.bind(this)}
                                    appSecretRefreshing={this.state.appSecretRefreshing}
                                />
                                <div className={slideClassName}>
                                    {this.renderRightPanel()}
                                </div>
                            </RightPanel>
                        </RightCardsContainer>
                        <RightPanel
                            className="myApp_role_authority_panel"
                            showFlag={this.state.isShowAuthRolePanel}
                        >
                            {authRoleView}
                        </RightPanel>
                    </div>
                </RightContent>
            </div>
        );
    }
});

module.exports = MyAppManage;