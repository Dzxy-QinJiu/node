var AppActions = require('../action/app-actions');
var userData = require('../../../../public/sources/user-data');
var AppFormStore = require('./app-form-store');
var language = require('../../../../public/language/getLanguage');

var emptyApp = {
    id: '',
    appName: '',
    appUrl: '',
    image: '',
    owner: '',
    descr: '',
    status: true
};

const DEFAULT_TAG = '全部';
function AppStore() {
    //在 编辑/添加 状态的时候appFormShow为true
    this.appFormShow = false;
    //是否展示确认删除的模态框
    this.modalDialogShow = false;
    //符合条的应用总长度
    this.appListSize = 0;
    //当前要展示的应用列表
    this.curAppList = [];
    // 编辑/添加 状态时，需要提交的域对象
    this.currentApp = emptyApp;
    //当前选择的安全域
    this.selectApps = [];
    //当前正在展示的是第几页的数据
    this.curPage = 1;
    //一页可显示的安全域的个数
    this.pageSize = 0;
    //查询内容
    this.searchContent = '';
    //查询时间
    this.startTime = '';
    this.endTime = '';
    //加载数据中。。。
    this.isLoading = true;
    //右侧面板的开关
    this.rightPanelShow = false;
    //获取应用详细信息中。。。
    this.appIsLoading = false;
    //表单的类型：添加/修改
    this.formType = 'add';
    //获取应用列表时，错误/暂无（符合条件的）数据的提示
    this.appListTipMsg = '';
    //应用的标签列表
    this.appTagList = [];
    //应用的 标签：个数
    this.appTagObj = {};
    //应用的 状态：个数
    this.appStatusObj = {};
    //选中的状态
    this.selectStatus = '';
    //是否展示筛选面板
    this.isFilterPanelShow = false;
    //已选过滤标签
    this.selectTag = DEFAULT_TAG;
    //所有应用的总长度
    this.allAppTotal = 0;
    // 是否要显示appForm，默认情况下显示APPForm
    this.isAppFormShow = true;

    this.versionUpgradeShow = false;
    //用户类型设置
    this.userTypeConfigShow = false;

    // 是否展示系统公告面板 默认情况下，不显示
    this.isAppNoticePanelShow = false;
    // 系统公告
    this.appNoticePanelShow = false;
    //获取成员详情失败的错误提示
    this.getAppDetailError = '';
    this.isShowAppOverViewPanel = false; // 是否展示应用概览页
    this.AppOverViewAppId = ''; // 应用概览页的id
    this.appList = []; //应用列表
    this.bindActions(AppActions);
}

//过滤状态的设置
AppStore.prototype.setSelectStatus = function(status) {
    this.selectStatus = status;
};

//过滤标签的设置
AppStore.prototype.setSelectTag = function(tag) {
    this.selectTag = tag;
};

//应用的标签列表
function getAppTagList(appTagObj) {
    var appTagList = [];
    _.each(appTagObj, function(value, key) {
        appTagList.push(key);
    });
    return appTagList;
}

AppStore.prototype.toggleFilterPanel = function() {
    this.isFilterPanelShow = !this.isFilterPanelShow;
};

//通过id获取其姓名
AppStore.prototype.getNickName = function(id, userList) {
    var nickName = '';
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
        appList.forEach(function(app) {
            if (app.id == id) {
                appName = app.name;
            }
        });
    }
    return appName || Intl.get('app.app.no.secret', '暂无密令APP');
};


AppStore.prototype.setCurApp = function(app) {
    if (app && !_.isString(app)) {
        this.currentApp = app;
    }
    this.rightPanelShow = true;
    this.appInfoShow = true;
    this.appFormShow = false;
};

AppStore.prototype.setCurAppDetail = function(appId) {
    var curApp = _.find(this.curAppList, function(app) {
        if (app.id == appId) {
            return true;
        }
    });
    this.currentApp = curApp || emptyApp;
};

AppStore.prototype.getCurAppById = function(app) {
    this.appIsLoading = false;
    if (_.isString(app)) {
        this.getAppDetailError = app;
    } else {
        this.getAppDetailError = '';
        this.currentApp = app;
        var curAppList = this.curAppList;
        for (var i = 0, len = curAppList.length; i < len; i++) {
            if (curAppList[i].id == app.id) {
                this.curAppList[i] = app;
                break;
            }
        }
    }
};
//公开方法，获取当前展示的列表
AppStore.prototype.getCurAppList = function(appListObj) {
    this.isLoading = false;
    if (_.isString(appListObj)) {
        //错误提示的赋值
        this.appListTipMsg = appListObj;
        this.curAppList = [];
        this.appListSize = 0;
        this.allAppTotal = 0;
        this.appTagList = [];
        this.appTagObj = {};
        this.appStatusObj = {};
    } else if (appListObj && _.isObject(appListObj)) {
        // 获取当前页应用列表applist
        var curAppList = appListObj.data;
        //应用标签
        this.appTagList = getAppTagList(appListObj.tags);
        this.appTagObj = appListObj.tags;
        //全部应用的个数
        if (!this.searchContent && !this.selectStatus && this.selectTag == DEFAULT_TAG) {
            this.allAppTotal = appListObj.list_size;
        }
        this.appStatusObj = appListObj.status;
        //确保返回的是个数组
        if (!_.isArray(curAppList)) {
            curAppList = [];
        }
        // 总共的应用数 根据搜索的内容不同，显示的应用数不同
        this.appListSize = appListObj.list_size;
        if (this.appListSize > 0) {
            //清空提示
            this.appListTipMsg = '';
        } else {
            //搜索无数据时的处理
            if (this.searchContent || this.selectStatus || this.selectTag != DEFAULT_TAG) {
                this.appListTipMsg = Intl.get('app.app.search.no.data', '没有符合条件的应用!');
            } else {
                this.appListTipMsg = Intl.get('my.app.no.app', '暂无应用!');
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

AppStore.prototype.closeAddPanel = function() {
    this.appFormShow = false;
    this.rightPanelShow = false;
};
//更新状态对应的数量
function updateStatusCount(oldStatus, newStatus, appStatusObj) {
    if (oldStatus != newStatus) {
        if (oldStatus == 0) {
            //禁用改启用
            appStatusObj.disable--;
            appStatusObj.enable++;
        } else {
            //启用改禁用
            appStatusObj.disable++;
            appStatusObj.enable--;
        }
    }
}
//修改完app后，app信息的更新
AppStore.prototype.updateApp = function(appModified, curApp) {
    if (appModified.hasOwnProperty('status')) {
        //更新状态对应的数量
        updateStatusCount(curApp.status, appModified.status, this.appStatusObj);
        curApp.status = appModified.status;
    } else {
        //更新标签对应的数量
        updateTagCount(curApp.tags, JSON.parse(appModified.tags), this.appTagObj);
        curApp.image = appModified.image;
        curApp.name = appModified.name;
        curApp.appUrl = appModified.appUrl;
        curApp.tags = JSON.parse(appModified.tags);
        curApp.ownerId = appModified.owner;
        let appFormState = AppFormStore.state;
        let appOwnerList = appFormState.appOwnerList;
        curApp.ownerName = this.getNickName(appModified.owner, appOwnerList);
        curApp.managers = appModified.managers;
        var managers = [];
        if (_.isArray(appModified.managers) && appModified.managers.length) {
            let appManagerList = appFormState.appManagerList;
            managers = appModified.managers.map(managerId => {
                return {managerId: managerId, managerName: this.getNickName(managerId , appManagerList)};
            });
        }
        curApp.managers = managers;
        if (appModified.secretApp) {
            curApp.secretAppId = appModified.secretApp;
            curApp.secretAppName = this.getAppNameById(appModified.secretApp);
        }
        curApp.descr = appModified.descr;
    }
};

//更新标签对应的数量
function updateTagCount(oldTags, newTags, appTagObj) {
    //原标签对应的数量减一
    oldTags.forEach(function(tag) {
        appTagObj[tag]--;
    });
    //修改后标签对应的数量加一
    newTags.forEach(function(tag) {
        if (appTagObj[tag]) {
            appTagObj[tag]++;
        } else {
            //新增标签
            appTagObj[tag] = 1;
        }

    });
}
//详情页修改标签后的处理
AppStore.prototype.afterEditAppTag = function(appModified) {
    if (_.isObject(appModified)) {
        //找到需要更新的应用
        let updateApp = _.find(this.curAppList, app => app.id == appModified.id);
        //更新标签对应的数量
        updateTagCount(updateApp.tags, JSON.parse(appModified.tags), this.appTagObj);
        //更新标签
        updateApp.tags = JSON.parse(appModified.tags);
    }
};

AppStore.prototype.afterEditApp = function(appModified) {
    if (_.isObject(appModified)) {
        //应用管理中修改完后的处理
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
    if (type === 'add') {
        this.currentApp = emptyApp;
    }
    this.isAppFormShow = true;
    this.formType = type;
    this.appInfoShow = false;
    this.appFormShow = true;
    this.rightPanelShow = true;
    this.isAppNoticePanelShow = false;
    this.appNoticePanelShow = false;
};

// 版本升级记录
AppStore.prototype.showVersionUpgradePanel = function() {
    this.isAppFormShow = false;
    this.appInfoShow = false;
    this.appFormShow = false;
    this.versionUpgradeShow = true;
    this.rightPanelShow = true;
    this.isAppNoticePanelShow = false;
    this.appNoticePanelShow = false;
    this.userTypeConfigShow = false;
};

// 系统公告
AppStore.prototype.showAppNoticePanel = function() {
    this.isAppFormShow = false;
    this.appInfoShow = false;
    this.appFormShow = false;
    this.versionUpgradeShow = false;
    this.rightPanelShow = true;
    this.isAppNoticePanelShow = true;
    this.appNoticePanelShow = true;
    this.userTypeConfigShow = false;
};


//用户类型设置
AppStore.prototype.showUserTypeConfigPanel = function() {
    this.isAppFormShow = false;
    this.appInfoShow = false;
    this.appFormShow = false;
    this.versionUpgradeShow = false;
    this.isAppNoticePanelShow = false;
    this.appNoticePanelShow = false;
    this.rightPanelShow = true;
    this.userTypeConfigShow = true;
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
    this.appFormShow = false;
    this.rightPanelShow = true;
    this.appIsLoading = true;
    this.versionUpgradeShow = false;
    this.appNoticePanelShow = false;
    //展示详情时，先清空上次的错误提示
    this.getAppDetailError = '';
    this.userTypeConfigShow = false;
};

AppStore.prototype.updateSearchContent = function(searchContent) {
    this.searchContent = searchContent;

};

AppStore.prototype.closeRightPanel = function() {
    this.versionUpgradeShow = false;
    this.appNoticePanelShow = false;
    this.rightPanelShow = false;
    this.userTypeConfigShow = false;
};

AppStore.prototype.returnInfoPanel = function() {
    this.appInfoShow = true;
    this.appFormShow = false;
    this.versionUpgradeShow = false;
    this.appNoticePanelShow = false;
    this.userTypeConfigShow = false;
};

module.exports = alt.createStore(AppStore, 'AppStore');