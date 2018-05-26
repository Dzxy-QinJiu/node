var UserLoginAnalysisAction = require('../action/user-login-analysis-action');
var ShareObj = require("../util/app-id-share-util");

function UserLoginAnalysisStore(){
    this.userOwnAppArray = [];
    this.selectedLogAppId = '';
    this.loginInfoInitialState();
    //绑定action
    this.bindActions(UserLoginAnalysisAction);
}

// 用户登录相关的初始信息
UserLoginAnalysisStore.prototype.loginInfoInitialState = function() {
    this.isLoading = true; 
    // 用户登录信息（时长、次数、首次和最后一次登录时间）
    this.loginInfo = {
        duration: "" , // 时长
        count: "", // 次数
        first: "", // 首次登录时间
        last: "", // 最后一次登录时间
        errorMsg: "" //错误信息
    };
    // 登录时长、登录次数
    this.loginChartInfo = {
        loginDuration: "", // 登录时长统计
        loginCount: "", // 登录次数统计
        errorMsg: "" //错误信息
    };
};
//恢复默认状态
UserLoginAnalysisStore.prototype.resetState = function() {
    this.loginInfoInitialState();
};

//获取用户应用列表
UserLoginAnalysisStore.prototype.getSingleUserAppList = function({appId,appList}) {
    this.selectedLogAppId = appId;
    this.userOwnAppArray = appList;
};

UserLoginAnalysisStore.prototype.setSelectedAppId = function(appId){
    this.selectedLogAppId = appId;
    ShareObj.share_differ_user_keep_app_id = this.selectedLogAppId;
};

// 用户登录信息（时长、次数、首次和最后一次登录时间）
UserLoginAnalysisStore.prototype.getUserLoginInfo = function(result){
    this.isLoading = result.loading;
    if (result.loading) {
        this.loginInfo.errorMsg = '';
    } else {
        if (result.error) {
            this.loginInfo.errorMsg = result.errorMsg;
        } else {
            if(_.isArray(result.data)){
                let loginList = result.data;
                let loginInfo = _.extend({},loginList[0], loginList[1], loginList[2], loginList[3]);
                // 时长
                this.loginInfo.duration = loginInfo.duration && loginInfo.duration.login_long || 0;
                // 次数
                this.loginInfo.count = loginInfo.count && loginInfo.count.logins || 0;
                // 首次登录
                this.loginInfo.first = -1;
                if (loginInfo.first != -1) {
                    this.loginInfo.first = moment(loginInfo.first).format(oplateConsts.DATE_TIME_FORMAT);
                }
                // 最后一次登录
                this.loginInfo.last = -1;
                if (loginInfo.last != -1) {
                    this.loginInfo.last = moment(loginInfo.last).format(oplateConsts.DATE_TIME_FORMAT);
                }
            }
        }
    }
};

// 用户登录统计图中登录时长、登录频次
UserLoginAnalysisStore.prototype.getUserLoginChartInfo = function(result){
    this.isLoading = result.loading;
    if(result.loading){
        this.loginChartInfo.errorMsg = '';
    } else {
        if (result.error) {
            this.loginChartInfo.errorMsg = result.errorMsg;
        } else {
            if(_.isArray(result.data)){
                let loginList = result.data;
                let loginChartInfo = _.extend({},loginList[0], loginList[1]);
                // 登录时长统计
                let loginDuration = loginChartInfo.loginDuration || [];
                let durationArray = [];
                if (_.isArray(loginDuration) && loginDuration.length > 0) {
                    _.each(loginDuration, (data) => {
                        let seconds = Math.floor(data.loginLong / 1000);
                        durationArray.push({date: data.timestamp, sum: seconds});
                    });
                }
                this.loginChartInfo.loginDuration = durationArray;
                let firstLoginTime = '', lastLoginTime = '';
                if (durationArray.length) {
                    let firstLoginObj = durationArray[0];
                    if(firstLoginObj && firstLoginObj.date) {
                        firstLoginTime = firstLoginObj.date;
                    }
                    let lastLoginObj = durationArray[durationArray.length - 1];
                    if(lastLoginObj && lastLoginObj.date) {
                        lastLoginTime = lastLoginObj.date;
                    }
                }
                // 登录次数统计
                let loginCount = loginChartInfo.loginCount;
                let frequencyArray = [];
                if (_.isArray(loginCount) && loginCount.length > 0) {
                    _.each(loginCount, (data) => {
                        if (lastLoginTime) {
                            if (data.timestamp < firstLoginTime && !data.count) {
                                return;
                            }
                            if (lastLoginTime >= data.timestamp || data.count) {
                                frequencyArray.push({date: data.timestamp, sum: data.count});
                            }
                        } else {
                            if (data.count) { // 有登录次数的情况
                                frequencyArray.push({date: data.timestamp, sum: data.count});
                            }
                        }
                    });
                }
                this.loginChartInfo.loginCount = frequencyArray;
            }
        }
    }
};

//使用alt导出store
module.exports = alt.createStore(UserLoginAnalysisStore , 'UserLoginAnalysisStore');