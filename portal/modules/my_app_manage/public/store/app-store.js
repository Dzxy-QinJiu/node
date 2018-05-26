var AppActions = require("../action/app-actions");
var userData = require("../../../../public/sources/user-data");
var AppFormStore = require("./app-form-store");
var emptyApp = {
    id: '',
    appName: '',
    appUrl: '',
    image: '',
    owner: '',
    descr: '',
    status: true
};

const FORMAT = oplateConsts.DATE_FORMAT;
function AppStore() {
    //在 编辑/添加 状态的时候appFormShow为true
    this.appFormShow = false;
    //是否展示确认删除的模态框
    this.modalDialogShow = false;
    //列表
    this.appListSize = 0;
    //当前要展示的应用列表
    this.curAppList = [];
    // 编辑/添加 状态时，需要提交的域对象
    this.currentApp = emptyApp;
    //当前选择的安全域
    this.selectApps = [];
    //当前正在展示的是第几页的数据
    this.curPage = 1;
    //查询内容
    this.searchContent = "";
    //一页展示的应用个数
    this.pageSize = 0;
    //查询时间
    this.startTime = "";
    this.endTime = "";
    //加载数据中。。。
    this.isLoading = true;
    //右侧面板的开关
    this.rightPanelShow = false;
    //所有成员列表
    this.userList = [];
    //获取应用详细信息中。。。
    this.appIsLoading = false;
    //表单的类型：添加/修改
    this.formType = "add";
    //获取应用列表时，错误/暂无（符合条件的）数据的提示
    this.appListTipMsg = "";
    //所有app列表
    this.allAppList = [];
    this.isShowAuthRolePanel = false;//是否展示我的应用的角色、权限面板
    this.showAuthoRoleAppId = "";//展示角色/权限的应用id
    this.showRoleAuthType = "role";//打开角色权限时，展示角色设置面板还是权限设置面板(默认打开设置角色面板)
    // 是否要显示appForm，默认情况下显示APPForm
    this.isAppFormShow = true;
    this.versionUpgradeShow = false;
    //用户类型设置
    this.userTypeConfigShow = false;
    //是否展示应用权限面板
    this.isAppAuthPanelShow = false;
    this.appAuthPanelShow = false;
    // 是否展示系统公告面板 默认情况下，不显示
    this.isAppNoticePanelShow = false;
    // 系统公告
    this.appNoticePanelShow = false;
    //是否正在刷新应用密钥
    this.appSecretRefreshing = false;
    //生成应用piwik收集key值
    this.appPiwikKey = "";
    //生成应用piwik收集key值错误的提示
    this.appPiwikKeyErrMsg = "";
    //正在加载中
    this.getPiwikKeyLoading = false;
    //应用代码跟踪
    this.appCodeTraceShow = false;
    this.bindActions(AppActions);
}

AppStore.prototype.showAppCodeTrace = function() {
    this.isAppFormShow = false;
    this.appInfoShow = false;
    this.appFormShow = false;
    this.versionUpgradeShow = false;
    this.isAppNoticePanelShow = false;
    this.appNoticePanelShow = false;
    this.userTypeConfigShow = false;
    this.rightPanelShow = true;
    this.appCodeTraceShow = true;
};
//修改应用到期时间后的更新
AppStore.prototype.afterUpdateAppExpireDate = function(appObj) {
    if (appObj.client_id) {
        //找到要更新的应用
        let updateApp = _.find(this.curAppList, app => app.id == appObj.client_id);
        //更新到期时间
        updateApp.expireDate = appObj.expire_date;
    }
};

//是否展示应用权限面板的设置
AppStore.prototype.setAppSecretRefreshing = function(flag) {
    this.appSecretRefreshing = flag;
};
//刷新应用密钥
AppStore.prototype.refreshAppSecret = function(appObj) {
    this.appSecretRefreshing = false;
    if (!_.isString(appObj)) {
        //找到刷新新密钥的应用
        let refreshApp = _.find(this.curAppList, app => app.id == appObj.id);
        //更新密钥
        refreshApp.appSecret = appObj.appSecret;
    }
};

//是否展示应用权限面板的设置
AppStore.prototype.showAppAuthPanel = function() {
    this.isAppAuthPanelShow = true;
    this.appAuthPanelShow = true;
    this.appInfoShow = false;
    this.isAppFormShow = false;
    this.appFormShow = false;
    this.versionUpgradeShow = false;
    this.isAppNoticePanelShow = false;
    this.appNoticePanelShow = false;
    this.appCodeTraceShow = false;
};
//是否展示我的应用的角色、权限面板
AppStore.prototype.showAuthRolePanel = function(appId) {
    this.isShowAuthRolePanel = true;
    this.showAuthoRoleAppId = appId;
};
//设置我的应用的角色权限时，展示角色面板还是权限面板
AppStore.prototype.setShowRoleAuthType = function(type) {
    this.showRoleAuthType = type;
};

//关闭角色权限设置面板时的处理
AppStore.prototype.closeAuthRolePanel = function() {
    this.isShowAuthRolePanel = false;
    this.showAuthoRoleAppId = "";
    this.showRoleAuthType = "role";
};

AppStore.prototype.setCurAppDetail = function(appId) {
    var curApp = _.find(this.curAppList, function(app) {
        if (app.id == appId) {
            return true;
        }
    });
    this.currentApp = curApp || emptyApp;
};
//公开方法，获取当前展示的列表
AppStore.prototype.getMyAppList = function(resultObj) {
    this.isLoading = false;
    if (_.isString(resultObj)) {
        //错误提示的赋值
        this.appListTipMsg = resultObj;
        this.curAppList = [];
        this.appListSize = 0;
    } else {
        resultObj = _.isObject(resultObj) ? resultObj : {};
        var curAppList = resultObj.data || [];
        //确保返回的是个数组
        if (!_.isArray(curAppList)) {
            curAppList = [];
        }
        this.appListSize = resultObj.list_size || 0;
        if (curAppList.length > 0) {
            //清空提示
            this.appListTipMsg = "";
        } else {
            //无数据时的处理
            if (this.searchContent) {
                this.appListTipMsg =Intl.get("app.app.search.no.data", "没有符合条件的应用!");
            } else {
                this.appListTipMsg = Intl.get("my.app.no.app", "暂无应用!");
            }
        }
        if (this.curPage == 1) {
            this.curAppList = [];
        }
        // 每次加载数据的长度
        var getCurAppListLength = curAppList.length;
        // 已经加载的数据长度
        var getTotalAppListLength = this.curAppList.length;
        // 去重
        if (getTotalAppListLength < (this.pageSize)) {
            this.curAppList = curAppList;
        } else {
            var rest = getTotalAppListLength % (this.pageSize);
            if (rest == 0) {
                this.curAppList = this.curAppList.concat(curAppList);
            } else {
                for (var j = rest; j < getCurAppListLength; j++) {
                    this.curAppList = this.curAppList.concat(curAppList[j]);
                }
            }
        }
    }
};

AppStore.prototype.getCurAppById = function(app) {
    this.appIsLoading = false;
    this.currentApp = app;
    var curAppList = this.curAppList;
    for (var i = 0, len = curAppList.length; i < len; i++) {
        if (curAppList[i].id == app.id) {
            this.curAppList[i] = app;
            break;
        }
    }
};

AppStore.prototype.closeAddPanel = function() {
    this.appFormShow = false;
    this.rightPanelShow = false;
    
};

AppStore.prototype.getCurAppKeyById = function(result) {
    if (result.loading){
        this.getPiwikKeyLoading = result.loading;
        this.appPiwikKeyErrMsg = "";
    }else if (result.error){
        this.appPiwikKey = "";
        this.appPiwikKeyErrMsg = result.errorMsg;
        this.getPiwikKeyLoading = result.loading;
    }else if (_.isObject(result.data) && _.isString(result.data.key)){
        this.appPiwikKey = result.data.key;
        this.getPiwikKeyLoading = result.loading;
        this.appPiwikKeyErrMsg = "";
    }
};
//通过id获取其姓名
//通过id获取其姓名
AppStore.prototype.getNickName = function(id) {
    var nickName = '';
    var userList = AppFormStore.state.appManagerList;
    if (userList && userList.length > 0) {
        for (var i = 0, len = userList.length; i < len; i++) {
            if (userList[i] && userList[i].userId == id) {
                nickName = userList[i].nickName;
            }
        }
    }
    return nickName;
};

//通过id获取app的名称
AppStore.prototype.getAppNameById = function(id) {
    var appName = id;
    var appList = AppFormStore.state.allAppList;
    if (appList && appList.length > 0) {
        let app = _.find(appList, app=>app.id == id);
        if (app) {
            appName = app.name;
        }
    }
    return appName || Intl.get("app.app.no.secret", "暂无密令APP");
};

//修改完app后，app信息的更新
AppStore.prototype.updateApp = function(appModified, curApp) {
    if (appModified.hasOwnProperty('appAuthMap')) {
        curApp.appAuthMap = JSON.parse(appModified.appAuthMap);
    } else {
        curApp.image = appModified.image;
        curApp.name = appModified.name;
        curApp.appUrl = appModified.appUrl;
        curApp.managers = appModified.managers;
        var managers = [];
        if (_.isArray(appModified.managers) && appModified.managers.length) {
            managers = appModified.managers.map(managerId=> {
                return {managerId: managerId, managerName: this.getNickName(managerId)};
            });
        }
        curApp.managers = managers;
        if (appModified.secretApp) {
            curApp.secretApp = appModified.secretApp;
            curApp.secretAppName = this.getAppNameById(appModified.secretApp);
        }
        curApp.descr = appModified.descr;
        curApp.captchaTime = appModified.captchaTime;
        curApp.sessionCaptcha = appModified.sessionCaptcha;
        curApp.ipCaptcha = appModified.ipCaptcha;
        curApp.status = appModified.status;
    }
};

AppStore.prototype.afterEditApp = function(appModified) {
    if (_.isObject(appModified)) {
        //修改完后的处理
        var curAppList = this.curAppList;
        for (var j = 0, rLen = curAppList.length; j < rLen; j++) {
            if (appModified.id == curAppList[j].id) {
                this.updateApp(appModified, this.curAppList[j]);
                break;
            }
        }
    }
};

AppStore.prototype.showAppForm = function(type) {
    if (type === "add") {
        this.currentApp = emptyApp;
    }
    this.isAppFormShow = true;
    this.formType = type;
    this.appInfoShow = false;
    this.isAppAuthPanelShow = false;
    this.appAuthPanelShow = false;
    this.versionUpgradeShow = false;
    this.appFormShow = true;
    this.rightPanelShow = true;
    this.isAppNoticePanelShow = false;
    this.appNoticePanelShow = false;
    this.appCodeTraceShow = false;

};

// 版本升级记录
AppStore.prototype.showVersionUpgradePanel = function() {
    this.isAppFormShow = false;
    this.appInfoShow = false;
    this.appFormShow = false;
    this.isAppAuthPanelShow = false;
    this.appAuthPanelShow = false;
    this.versionUpgradeShow = true;
    this.rightPanelShow = true;
    this.isAppNoticePanelShow = false;
    this.appNoticePanelShow = false;
    this.userTypeConfigShow = false;
    this.appCodeTraceShow = false;
};

// 系统公告
AppStore.prototype.showAppNoticePanel = function() {
    this.isAppFormShow = false;
    this.appInfoShow = false;
    this.appFormShow = false;
    this.isAppAuthPanelShow = false;
    this.appAuthPanelShow = false;
    this.versionUpgradeShow = false;
    this.rightPanelShow = true;
    this.isAppNoticePanelShow = true;
    this.appNoticePanelShow = true;
    this.userTypeConfigShow = false;
    this.appCodeTraceShow = false;
};

//用户类型设置
AppStore.prototype.showUserTypeConfigPanel = function() {
    this.isAppFormShow = false;
    this.appInfoShow = false;
    this.appFormShow = false;
    this.isAppAuthPanelShow = false;
    this.appAuthPanelShow = false;
    this.versionUpgradeShow = false;
    this.isAppNoticePanelShow = false;
    this.appNoticePanelShow = false;
    this.rightPanelShow = true;
    this.userTypeConfigShow = true;
    this.appCodeTraceShow = false;
};

AppStore.prototype.showModalDialog = function() {
    this.modalDialogShow = true;
};

AppStore.prototype.hideModalDialog = function() {
    this.modalDialogShow = false;
};

AppStore.prototype.updateCurPage = function(curPage) {
    this.curPage = curPage;
};

AppStore.prototype.updatePageSize = function(pageSize) {
    this.pageSize = pageSize;
};

AppStore.prototype.showAppInfo = function() {
    this.appInfoShow = true;
    this.appIsLoading = true;
    this.appFormShow = false;
    this.rightPanelShow = true;
    this.versionUpgradeShow = false;
    this.appAuthPanelShow = false;
    this.appNoticePanelShow = false;
    this.userTypeConfigShow = false;
    this.appCodeTraceShow = false;
};

AppStore.prototype.updateSearchContent = function(searchContent) {
    this.searchContent = searchContent;

};

AppStore.prototype.closeRightPanel = function() {
    this.versionUpgradeShow = false;
    this.appNoticePanelShow = false;
    this.userTypeConfigShow = false;
    this.rightPanelShow = false;
    this.appCodeTraceShow = false;
};

AppStore.prototype.returnInfoPanel = function() {
    this.appInfoShow = true;
    this.appFormShow = false;
    this.versionUpgradeShow = false;
    this.appAuthPanelShow = false;
    this.appNoticePanelShow = false;
    this.userTypeConfigShow = false;
    this.appCodeTraceShow = false;
};

module.exports = alt.createStore(AppStore, 'MyAppStore');
