var UserLoginAnalysisAction = require('../action/user-login-analysis-action');
var ShareObj = require('../util/app-id-share-util');

function UserLoginAnalysisStore(){
    this.userOwnAppArray = [];
    this.selectedLogAppId = '';
    this.userIndicator = [];
    // 选择产品对应的终端类型
    this.selectAppTerminals = [];
    this.appTerminalType = ''; // 应用终端类型，默认全部
    this.userEngagementScore = [];
    this.userBasicScore = [];
    this.loginInfoInitialState();
    //绑定action
    this.bindActions(UserLoginAnalysisAction);
}

// 用户登录相关的初始信息
UserLoginAnalysisStore.prototype.loginInfoInitialState = function() {
    // 用户登录信息（时长、次数、首次和最后一次登录时间）
    this.loginInfo = {
        duration: '' , // 时长
        count: '', // 次数
        first: '', // 首次登录时间
        last: '', // 最后一次登录时间
        errorMsg: '' //错误信息
    };
    // 登录时长、登录次数
    this.loginChartInfo = {
        loginDuration: '', // 登录时长统计
        loginCount: '', // 登录次数统计
        errorMsg: '' //错误信息
    };
    // 用户登录分数
    this.loginScore = {
        data: {},
        errorMsg: '', //错误信息
    };
    // 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
    this.activeInfo = {
        duration: '' , // 登录时长
        count: '', // 登录次数
        activeDays: '', // 活跃天数
        errorMsg: '' //错误信息
    };
    
    //存放不同应用下数据
    this.appUserDataMap = {};
    this.userOwnAppArray = [];

};
//恢复默认状态
UserLoginAnalysisStore.prototype.resetState = function() {
    this.loginInfoInitialState();
};

//获取用户应用列表
UserLoginAnalysisStore.prototype.getSingleUserAppList = function({appId,appList}) {
    this.selectedLogAppId = appId;
    this.userOwnAppArray = appList;
    if (_.get(appList, 'length') > 0) {
        //默认展示已选择的应用的分析数据
        if (this.selectedLogAppId) {
            this.showDetailMap = {
                [this.selectedLogAppId]: true
            };
        } 
        //否则展示第一个应用的分析数据
        else {
            this.showDetailMap = {
                [appList[0].app_id]: true
            };
        }
        let selectedAppId = this.selectedLogAppId || appList[0].app_id;
        let matchSelectApp = _.find(appList, item => item.app_id === selectedAppId);
        if (matchSelectApp) {
            this.selectAppTerminals = matchSelectApp.terminals || [];
        }
    }
};

UserLoginAnalysisStore.prototype.setSelectedAppTerminals = function(appId){
    let matchSelectApp = _.find(this.userOwnAppArray, item => item.app_id === appId);
    if (matchSelectApp) {
        this.selectAppTerminals = matchSelectApp.terminals || [];
    }
};

UserLoginAnalysisStore.prototype.setAppTerminalsType = function(type){
    this.appTerminalType = type;
};

UserLoginAnalysisStore.prototype.setSelectedAppId = function(appId){
    this.selectedLogAppId = appId;
    ShareObj.share_differ_user_keep_app_id = this.selectedLogAppId;
};
UserLoginAnalysisStore.prototype.getUserScoreIndicator = function(result){
    this.userIndicator = _.get(result,'list',[]);
};
UserLoginAnalysisStore.prototype.getUserEngagementRule = function(result){
    this.userEngagementScore = _.get(result,'list',[]);
};
UserLoginAnalysisStore.prototype.getUserScoreLists = function(result){
    this.userBasicScore = _.get(result,'list',[]);
};
 
// 用户登录信息（时长、次数、首次和最后一次登录时间）
UserLoginAnalysisStore.prototype.getUserLoginInfo = function(result){
    const appid = result.paramsObj.appid;
    this.appUserDataMap[appid] = this.appUserDataMap[appid] || {
        loading: false
    };
    const item = this.appUserDataMap[appid];
    item.loading = result.loading;
    item.loginInfo = {
        errorMsg: ''
    };
    if (result.loading) {
        item.loginInfo.errorMsg = '';
    } else {
        if (result.error) {
            item.loginInfo.errorMsg = result.errorMsg;
        } else {
            if(_.isArray(result.data)){
                let loginList = result.data;
                let loginInfo = _.extend({},loginList[0], loginList[1], loginList[2], loginList[3]);
                // 时长
                item.loginInfo.duration = loginInfo.duration && loginInfo.duration.login_long || 0;
                // 次数
                item.loginInfo.count = loginInfo.count && loginInfo.count.logins || 0;
                // 首次登录
                item.loginInfo.first = -1;
                if (loginInfo.first !== -1) {
                    item.loginInfo.first = moment(loginInfo.first).format(oplateConsts.DATE_TIME_FORMAT);
                }
                // 最后一次登录
                item.loginInfo.last = -1;
                if (loginInfo.last !== -1) {
                    item.loginInfo.last = moment(loginInfo.last).format(oplateConsts.DATE_TIME_FORMAT);
                }
            }
        }
    }
};

// 用户登录统计图中登录时长、登录频次
UserLoginAnalysisStore.prototype.getUserLoginChartInfo = function(result){
    const appid = _.get(result,'paramsObj.appid');
    this.appUserDataMap[appid] = this.appUserDataMap[appid] || {
        loading: false
    };
    const item = this.appUserDataMap[appid];
    item.isLoading = result.loading;
    item.loginChartInfo = {
        errorMsg: ''
    };
    item.timeType = _.get(result,'paramsObj.timeType');
    if(result.loading){
        item.loginChartInfo.errorMsg = '';
    } else {
        if (result.error) {
            item.loginChartInfo.errorMsg = result.errorMsg;
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
                let completeDurationList = durationArray;
                if (completeDurationList.length && completeDurationList.length < 365) {
                    const endDate = completeDurationList[completeDurationList.length - 1].date;
                    completeDurationList = Array.from({length: 365}, (x, idx) => {
                        /// 比如：从 2020/2/14先前推，2019/2/15是这一年的开头，需要加1计算开始时间
                        const startDate = moment(endDate).subtract(1, 'years').add(1, 'day');
                        const dayItem = {
                            date: startDate.add(idx, 'days').valueOf(),
                            sum: 0
                        };
                        durationArray.forEach(item => {
                            if (moment(dayItem.date).format('YYYY MM DD') === moment(item.date).format('YYYY MM DD')) {
                                dayItem.sum = item.sum;
                            }
                        });
                        return dayItem;
                    });
                }
                item.loginChartInfo.loginDuration = completeDurationList;
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
                item.loginChartInfo.loginCount = loginChartInfo.loginCount.map(x => ({
                    date: x.timestamp,
                    sum: x.count
                }));
            }
        }
    }
};

// 获取用户的分数
UserLoginAnalysisStore.prototype.getLoginUserScore = function(result) {
    const appid = result.paramsObj.app_id;
    this.appUserDataMap[appid] = this.appUserDataMap[appid] || {
        loading: false
    };
    const item = this.appUserDataMap[appid];
    item.loading = result.loading;
    item.loginScore = {
        errorMsg: ''
    };
    if (result.loading) {
        item.loginScore.errorMsg = '';
    } else {
        if (result.error) {
            item.loginScore.errorMsg = result.errorMsg;
        } else {
            item.loginScore.errorMsg = '';
            item.loginScore.data = result.data;
        }
    }
};

// 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
UserLoginAnalysisStore.prototype.getLoginUserActiveStatistics = function(result){
    const appid = result.paramsObj.appid;
    this.appUserDataMap[appid] = this.appUserDataMap[appid] || {
        loading: false
    };
    const item = this.appUserDataMap[appid];
    item.isLoading = result.loading;
    item.activeInfo = {
        errorMsg: ''
    };
    if (result.loading) {
        item.activeInfo.errorMsg = '';
    } else {
        if (result.error) {
            item.activeInfo.errorMsg = result.errorMsg;
        } else {
            let resData = _.get(result, 'data', []);
            if (_.get(resData, 'length')) {
                let loginActiveInfo = _.extend({},resData[0], resData[1], resData[2]);
                // 在线时长
                item.activeInfo.duration = _.get(loginActiveInfo, 'duration.login_long', 0);
                // 登录次数
                item.activeInfo.count = _.get(loginActiveInfo, 'count.logins', 0);
                // 活跃天数
                item.activeInfo.activeDays = _.get(loginActiveInfo, 'activeDays[0].days', 0);
            }
        }
    }
};
//使用alt导出store
module.exports = alt.createStore(UserLoginAnalysisStore , 'UserLoginAnalysisStore');