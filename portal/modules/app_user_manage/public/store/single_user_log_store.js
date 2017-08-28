var SingleUserLogAction = require('../action/single_user_log_action');
var ShareObj = require("../util/app-id-share-util");
var _ = require('underscore');

function SingleUserLogStore(){
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(SingleUserLogAction);
}

SingleUserLogStore.prototype.resetState = function() {
    this.isLoading = true;
    this.userOwnAppArray = [];
    this.selectedLogAppId = '';
    this.auditLogList = [];
    this.searchName='';
    this.curPage = 1;
    this.pageSize = 10;
    this.total = 0;
    this.appUserListResult = "loading";
    this.listenScrollBottom = true;
    // 类型是否过滤，默认过滤心跳服务，this.typeFilter = ''显示全部日志
    this.typeFilter = "心跳服务"
    //开始时间
    this.startTime = '';
    //结束时间
    this.endTime = '';
    // 获取单个用户日志失败的错误提示
    this.getUserLogErrorMsg = '';
    // 用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录频次统计）
    this.loginInfo = {
        isLoading : true,  //是否加载中
        duration: 0 ,  // 时长
        count: 0,  // 次数
        first: -1, // 首次登录时间
        last: -1, // 最后一次登录时间
        loginDuration: [], // 登录时长统计
        loginCount: [], // 登录频次统计
        errorMsg : ""   //错误信息
    };
};

//恢复默认状态
SingleUserLogStore.prototype.dismiss = function() {
    this.resetState();
};

SingleUserLogStore.prototype.getLogsByTime = function() {
    this.curPage = 1;
    this.pageSize = 10;
    this.total = 0;
    this.isLoading = true;
    this.auditLogList = [];
    this.appUserListResult = "loading";
    this.listenScrollBottom = true;
    // 用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录频次统计）
    this.loginInfo = {
        isLoading : true,  //是否加载中
        duration: 0 ,  // 时长
        count: 0,  // 次数
        first: -1, // 首次登录时间
        last: -1, // 最后一次登录时间
        loginDuration: [], // 登录时长统计
        loginCount: [], // 登录频次统计
        errorMsg : ""   //错误信息
    };
};

SingleUserLogStore.prototype.getLogsByApp = function() {
    this.curPage = 1;
    this.pageSize = 10;
    this.total = 0;
    this.auditLogList = [];
    this.appUserListResult = "loading";
    this.listenScrollBottom = true;
    // 用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录频次统计）
    this.loginInfo = {
        isLoading : true,  //是否加载中
        duration: 0 ,  // 时长
        count: 0,  // 次数
        first: -1, // 首次登录时间
        last: -1, // 最后一次登录时间
        loginDuration: [], // 登录时长统计
        loginCount: [], // 登录频次统计
        errorMsg : ""   //错误信息
    };
};

SingleUserLogStore.prototype.getLogsBySearch = function() {
    this.curPage = 1;
    this.pageSize = 10;
    this.total = 0;
    this.auditLogList = [];
    this.appUserListResult = "loading";
    this.listenScrollBottom = true;
};

SingleUserLogStore.prototype.changUserIdKeepSearch = function() {
    this.isLoading = true;
    this.userOwnAppArray = [];
    this.selectedLogAppId = '';
    this.auditLogList = [];
    this.curPage = 1;
    this.pageSize = 10;
    this.total = 0;
    this.appUserListResult = "loading";
    this.listenScrollBottom = true;
};

// 获取单个用户审计日志的信息
SingleUserLogStore.prototype.getSingleAuditLogList = function (result) {
    this.isLoading = false;
    if (result.loading){
        this.appUserListResult = "loading";
    } else if (result.error){
        this.appUserListResult = "";
        this.getUserLogErrorMsg = result.errorMsg;
    } else {
        this.getUserLogErrorMsg = "";
        this.appUserListResult = "";
        this.auditLogList = this.auditLogList.concat(result.data.user_logs);
        this.curPage++;
        this.total = result.data.total;
    }

};

//获取用户应用列表
SingleUserLogStore.prototype.getSingleUserAppList = function({appId,appList}) {
    this.selectedLogAppId = appId;
    this.userOwnAppArray = appList;
};

SingleUserLogStore.prototype.setSelectedAppId = function(appId){
    this.selectedLogAppId = appId;
    ShareObj.share_differ_user_keep_app_id = this.selectedLogAppId;
};

// 记录搜索框中输入的内容
SingleUserLogStore.prototype.handleSearchEvent = function (searchName) {
    this.searchName = searchName;
};

// 根据时间选择日志
SingleUserLogStore.prototype.changeSearchTime = function({startTime,endTime}) {
    this.startTime = startTime;
    this.endTime = endTime;
};

// 用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录频次统计）
SingleUserLogStore.prototype.getUserLoginInfo = function(result){
    this.loginInfo.isLoading = result.loading;
    if(result.loading){
        this.loginInfo.errorMsg = '';
    } else {
        if (result.error) {
            this.loginInfo.errorMsg = result.errorMsg;
        } else {
            if(_.isArray(result.data)){
                let loginList = result.data;
                let loginInfo = _.extend({},loginList[0], loginList[1], loginList[2], loginList[3], loginList[4], loginList[5]);
                // 时长
                this.loginInfo.duration = loginInfo.duration.login_long;
                // 次数
                this.loginInfo.count = loginInfo.count.logins || 0;
                // 首次登录
                if (loginInfo.first != -1) {
                    this.loginInfo.first = moment(loginInfo.first).format(oplateConsts.DATE_TIME_FORMAT);
                }
                // 最后一次登录
                if (loginInfo.last != -1) {
                    this.loginInfo.last = moment(loginInfo.last).format(oplateConsts.DATE_TIME_FORMAT);
                }
                // 登录时长统计
                let loginDuration = loginInfo.loginDuration;
                let durationArray = [];
                if (_.isArray(loginDuration) && loginDuration.length > 0) {
                    _.each(loginDuration, (data) => {
                        let seconds = Math.floor(data.loginLong / 1000);
                        durationArray.push({date: data.timestamp, sum: seconds});
                    });
                }
                this.loginInfo.loginDuration = durationArray;

                let lastLoginTime = '';
                if (durationArray.length) {
                    let lastLoginObj = durationArray[durationArray.length - 1];
                    if(lastLoginObj && lastLoginObj.date) {
                        lastLoginTime = lastLoginObj.date;
                    }
                }
                // 登录次数统计
                let loginCount = loginInfo.loginCount;
                let frequencyArray = [];
                if (_.isArray(loginCount) && loginCount.length > 0) {
                    _.each(loginCount, (data) => {
                        if (lastLoginTime) {
                            if (lastLoginTime >= data.timestamp) {
                                frequencyArray.push({date: data.timestamp, sum:  data.count});
                            }
                        } else {
                            if (this.loginInfo.count) { // 有登录次数的情况
                                frequencyArray.push({date: data.timestamp, sum:  data.count});
                            }
                        }
                    });
                }
                this.loginInfo.loginCount = frequencyArray;
            }
        }
    }
};

// 过滤心跳服务
SingleUserLogStore.prototype.filterType = function(status){
    this.typeFilter = status ? "心跳服务": '';
    this.curPage = 1;
    this.auditLogList = [];
};

//使用alt导出store
module.exports = alt.createStore(SingleUserLogStore , 'SingleUserLogStore');