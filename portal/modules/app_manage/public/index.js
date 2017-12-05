var RightContent = require("../../../components/privilege/right-content");
var RightCardsContainer = require("../../../components/rightCardsContainer");
var AppStore = require("./store/app-store");
var AppAction = require("./action/app-actions");
var AddAppForm = require("./views/app-form");
var AppInfo = require("./views/app-info");
var rightPanelUtil = require("../../../components/rightPanel");
var RightPanel = rightPanelUtil.RightPanel;
var AppFilterAdv = require("./views/app-filter-adv");
var AppFormAction = require("./action/app-form-actions");
var VersionUpgradeLog = require('./views/version-upgrade-log');
var UserTypeConfig=require('./views/user-type-config');
var AppNotice = require('./views/app-notice');
var Spinner = require("../../../components/spinner");
var classNames = require("classnames");
import Trace from "LIB_DIR/trace";
var openTimeout = null;//打开面板时的时间延迟设置
var focusTimeout = null;//focus事件的时间延迟设置
var DEFAULT_TAG = "全部", DISABLE = "disable";
var AppManage = React.createClass({
    getInitialState: function () {
        return AppStore.getState();
    },
    onChange: function () {
        this.setState(AppStore.getState());
    },

    componentDidMount: function () {
        $("body").css("overflow", "hidden");
        AppStore.listen(this.onChange);
    },

    componentWillUnmount: function () {
        $("body").css("overflow", "auto");
        AppStore.unlisten(this.onChange);
    },
    //获取搜索条件
    getSearchObj: function (curPage, pageSize, searchContent) {
        var searchObj = {
            cur_page: curPage,
            page_size: pageSize
        }, selectTag = this.state.selectTag, selectStatus = this.state.selectStatus;
        //搜索框的搜索,搜索关键字：应用名、描述
        if (searchContent) {
            searchObj.app_name = searchContent;
            searchObj.app_desc = searchContent;
        }
        //标签的筛选
        if (selectTag && selectTag !== DEFAULT_TAG) {
            searchObj.tag = selectTag;
        }
        //状态的筛选
        if (selectStatus) {
            searchObj.status = selectStatus == DISABLE ? 0 : 1;
        }
        return searchObj;
    },
    events: {
        showAppForm: function (type) {
            if (type == 'add') {
                Trace.traceEvent($(this.getDOMNode()).find(".right-cards-container"),"点击添加应用按钮");
            }
            //type：“edit”/"add"
            AppFormAction.setOwnerListLoading(true);
            AppFormAction.getAppOwnerList();
            AppFormAction.setManagerListLoading(true);
            AppFormAction.getAppManagerList();
            AppFormAction.setAllAppListLoading(true);
            AppFormAction.getAllAppList();
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
        showUserTypeConfigPanel:function () {
            AppAction.showUserTypeConfigPanel();
        },
        
        //status:0->停用、1->启用
        updateAppStatus: function (appId, status) {
            AppAction.updateAppStatus({id: appId, status: status}, "appManage");
        },

        //切换页数时，当前页展示数据的修改
        onChangePage: function (count, curPage) {
            AppAction.updateCurPage(curPage);
            var searchObj = this.getSearchObj(curPage, count, this.state.searchContent);
            AppAction.getCurAppList(searchObj);
        },
        //展示模态框
        showModalDialog: function () {
            AppAction.showModalDialog();
        },
        //隐藏模态框
        hideModalDialog: function () {
            AppAction.hideModalDialog();
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
                if (!this.state.versionUpgradeShow && !this.state.appNoticePanelShow && !this.state.userTypeConfigShow) {
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
            Trace.traceEvent($(this.getDOMNode()).find(".search-input-block"),"按应用名/描述搜索应用");
            AppAction.updateCurPage(1);
            AppAction.updateSearchContent(searchContent);
            var searchObj = this.getSearchObj(1, this.state.pageSize, searchContent);
            AppAction.getCurAppList(searchObj);
        },
        //右侧面板的关闭
        closeRightPanel: function () {
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
        //展示、收起标签筛选面板的处理
        toggleFilterPanel: function () {
            Trace.traceEvent($(this.getDOMNode()).find(".tag-filter-btn"),"展示/收起标签筛选");
            AppAction.toggleFilterPanel();
        },
        //设置选择的筛选标签，并筛选应用
        filterAppByTags: function (tag) {
            Trace.traceEvent($(this.getDOMNode()).find(".search-input-block"),"按标签筛选应用");
            AppAction.setSelectTag(tag);
            AppAction.updateCurPage(1);
            var _this = this;
            setTimeout(function () {
                var searchObj = _this.getSearchObj(1, _this.state.pageSize, _this.state.searchContent);
                AppAction.getCurAppList(searchObj);
            });
        },
        editAppTag: function (data, callback) {
            AppFormAction.editApp(data, callback);
        },
        //设置筛选状态，并筛选应用
        filterAppByStatus: function (status) {
            Trace.traceEvent($(this.getDOMNode()).find(".search-input-block"),"按状态筛选应用");
            AppAction.setSelectStatus(status);
            AppAction.updateCurPage(1);
            var _this = this;
            setTimeout(function () {
                var searchObj = _this.getSearchObj(1, _this.state.pageSize, _this.state.searchContent);
                AppAction.getCurAppList(searchObj);
            });
        }
    },

    renderRightPanel: function () {
        if (this.state.isAppFormShow) {
            return (
                <AddAppForm
                    closeRightPanel={this.events.closeRightPanel}
                    returnInfoPanel={this.events.returnInfoPanel}
                    formType={this.state.formType}
                    app={this.state.currentApp}
                    appFormShow={this.state.appFormShow}
                    appTagList={this.state.appTagList}
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
        }else if (this.state.userTypeConfigShow){
            return (
                <UserTypeConfig
                    closeRightPanel={this.events.closeRightPanel}
                    returnInfoPanel={this.events.returnInfoPanel}
                    userTypeConfigShow={this.state.userTypeConfigShow}
                    appId={this.state.currentApp.id}
                    appName={this.state.currentApp.name}
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
            var createDate = app.createDate ? moment(app.createDate).format(oplateConsts.DATE_FORMAT) : "";
            var expireDate = app.expireDate ? moment(app.expireDate).format(oplateConsts.DATE_FORMAT) : "";
            if (expireDate) {
                pageApp.date = {
                    label: createDate + Intl.get("common.time.connector", " 至") + expireDate,
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
        var firstLoading = this.state.isLoading;
        var _this = this;
        var slideClassName = classNames("right-panel-content", {
            "right-panel-content-slide": (_this.state.appNoticePanelShow || _this.state.userTypeConfigShow)
        });
        return (
            <div className="app_manage_style">
                {
                    firstLoading ? <div className="firstLoading">
                        <Spinner />
                    </div> : null
                }
                <RightContent>
                    <div className="app_content" data-tracename="应用管理">
                        <RightCardsContainer
                            currentCard={this.state.currentApp}
                            cardListSize={this.state.appListSize}
                            curCardList={this.getCardShowAppList()}
                            selectCards={this.state.selectApps}
                            listTipMsg={this.state.appListTipMsg}
                            curPage={this.state.curPage}
                            pageSize={this.state.pageSize}
                            searchPlaceHolder={Intl.get("app.search.placeholder", "应用名/描述")}
                            updatePageSize={this.events.updatePageSize.bind(this)}
                            showCardForm={this.events.showAppForm.bind(this)}
                            hideCardForm={this.events.hideAppForm}
                            submitCardForm={this.events.submitAppForm}
                            editCard={this.events.editApp}
                            changePageEvent={this.events.onChangePage.bind(this)}
                            showCardInfo={this.events.showAppInfo.bind(this)}
                            searchEvent={this.events.searchEvent.bind(this)}
                            modalType={modalType}
                            addRoleStr={"APP_MANAGE_ADD_APP"}
                            isPanelShow={this.state.isFilterPanelShow}
                            toggleFilterPanel={this.events.toggleFilterPanel.bind(this)}
                            type="appManage"
                        >
                            <AppFilterAdv filterAppByTags={this.events.filterAppByTags.bind(this)}
                                          allAppTotal={this.state.allAppTotal}
                                          appTagObj={this.state.appTagObj}
                                          appStatusObj={this.state.appStatusObj}
                                          appTagList={this.state.appTagList}
                                          isFilterPanelShow={this.state.isFilterPanelShow}
                                          selectStatus={this.state.selectStatus}
                                          filterAppByStatus={this.events.filterAppByStatus.bind(this)}
                                          selectTag={this.state.selectTag}/>
                            <RightPanel className="white-space-nowrap" showFlag={this.state.rightPanelShow} >
                                <AppInfo
                                    appInfo={this.state.currentApp}
                                    getAppDetailError={this.state.getAppDetailError}
                                    appInfoShow={this.state.appInfoShow}
                                    appFormShow={this.state.appFormShow}
                                    versionUpgradeShow={this.state.versionUpgradeShow}
                                    userTypeConfigShow={this.state.userTypeConfigShow}
                                    isAppNoticePanelShow={this.state.appNoticePanelShow}
                                    infoIsloading={this.state.appIsLoading}
                                    modalDialogShow={this.state.modalDialogShow}
                                    modalType={modalType}
                                    showModalDialog={this.events.showModalDialog.bind(this)}
                                    hideModalDialog={this.events.hideModalDialog}
                                    showEditForm={this.events.showAppForm}
                                    showVersionUpgradePanel={this.events.showVersionUpgradePanel}
                                    showUserTypeConfigPanel={this.events.showUserTypeConfigPanel}
                                    updateStatus={this.events.updateAppStatus}
                                    showAppNoticePanel={this.events.showAppNoticePanel}
                                    closeRightPanel={this.events.closeRightPanel}
                                    editAppTag={this.events.editAppTag}
                                    appTagList={this.state.appTagList}
                                />
                                <div className={slideClassName}>
                                    {this.renderRightPanel()}
                                </div>
                            </RightPanel>
                        </RightCardsContainer>
                    </div>
                </ RightContent >
            </div>
        );
    }
});

module.exports = AppManage;