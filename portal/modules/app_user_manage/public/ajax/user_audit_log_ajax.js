var appAjaxTrans = require('../../../common/public/ajax/app');
import routeList from 'MOD_DIR/common/route';
import ajax from 'MOD_DIR/common/ajax';
// 获取所有用户审计日志信息
var auditLogAjax = null;
exports.getAuditLogList = function(searchObj){
    var Deferred = $.Deferred();
    auditLogAjax && auditLogAjax.abort();
    auditLogAjax = $.ajax({
        url: '/rest/user/log',
        type: 'post',
        data: searchObj,
        dateType: 'json',
        success: function(data){
            Deferred.resolve(data);
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('errorcode.7', '获取审计日志失败'));
            }
        }
    });
    return Deferred.promise();
};

// 获取单个用户的审计日志信息
var singleAuditLogAjax = null;
exports.getSingleAuditLogList = function(searchObj){
    let user_id = searchObj.user_id;
    delete searchObj.user_id;
    var Deferred = $.Deferred();
    singleAuditLogAjax && singleAuditLogAjax.abort();
    singleAuditLogAjax = $.ajax({
        url: '/rest/log/app/user_detail/' + user_id,
        type: 'get',
        data: searchObj,
        dateType: 'json',
        success: function(data){
            Deferred.resolve(data);
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.log.single.get.error', '获取单个审计日志失败'));
            }
        }
    });
    return Deferred.promise();
};

//获取单个用户全部审计日志
exports.getSingleUserAllAuditLog = function(paramsObj) {
    const route = routeList.find(x => x.handler === 'getSingleUserAllAuditLog');
    const config = {
        url: route.path,
        type: route.method
    };
    if (paramsObj) { 
        if (paramsObj.params) {
            config.params = paramsObj.params;
        }
        if (paramsObj.data) {
            config.data = paramsObj.data;
        }        
    }
    return ajax(config);
};

// 根据单个用户user_id获取用户应用列表
var singleUserLogAppAjax = null;
exports.getSingleUserAppList = function(searchObj){
    let Deferred = $.Deferred();
    singleUserLogAppAjax && singleUserLogAppAjax.abort();
    singleUserLogAppAjax = $.ajax({
        url: '/rest/appuser/detail/' + searchObj.user_id,
        type: 'get',
        dateType: 'json',
        success: function(data){
            Deferred.resolve(data);
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.log.get.log.fail', '获取操作日志信息失败！'));
            }
        }
    });
    return Deferred.promise();
};

// 用户登录信息（时长、次数、首次和最后一次登录时间）
let UserLoginInfoAjax = null;
exports.getUserLoginInfo = function(queryobj){
    let loginInfoObj = _.clone(queryobj);
    let user_id = loginInfoObj.user_id;
    delete loginInfoObj.user_id;
    let Deferred = $.Deferred();
    UserLoginInfoAjax && UserLoginInfoAjax.abort();
    UserLoginInfoAjax = $.ajax({
        url: '/rest/user/login/info/' + user_id,
        type: 'get',
        dataType: 'json',
        data: loginInfoObj,
        success: function(data){
            Deferred.resolve(data);
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.log.login.fail', '获取登录信息失败！'));
            }
        }
    });
    return Deferred.promise();
};

// 用户登录统计图中登录时长、登录频次
let UserLoginChartAjax = null;
exports.getUserLoginChartInfo = function(queryobj){
    let loginInfoChartObj = _.clone(queryobj);
    let user_id = loginInfoChartObj.user_id;
    delete loginInfoChartObj.user_id;
    let Deferred = $.Deferred();
    UserLoginChartAjax && UserLoginChartAjax.abort();
    UserLoginChartAjax = $.ajax({
        url: '/rest/user/login/chart/' + user_id,
        type: 'get',
        dataType: 'json',
        data: loginInfoChartObj,
        success: function(data){
            Deferred.resolve(data);
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.log.login.fail', '获取登录信息失败！'));
            }
        }
    });
    return Deferred.promise();
};

// 获取用户的分数
let loginUserScoreAjax = null;
exports.getLoginUserScore = function(reqData, type){
    let Deferred = $.Deferred();
    loginUserScoreAjax && loginUserScoreAjax.abort();
    loginUserScoreAjax = $.ajax({
        url: '/rest/login/user/score/' + type,
        type: 'get',
        data: reqData,
        dateType: 'json',
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,status) => {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.get.score.failed', '获取用户分数失败') );
            }
        }
    });
    return Deferred.promise();
};
// 获取成员信息
exports.getSaleMemberList = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/sale/member/' + reqData.type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
let LoginUserActiveStatisticsAjax = null;
exports.getLoginUserActiveStatistics = (queryobj, type) => {
    let loginInfoObj = _.clone(queryobj);
    let user_id = loginInfoObj.user_id;
    delete loginInfoObj.user_id;
    let Deferred = $.Deferred();
    LoginUserActiveStatisticsAjax && LoginUserActiveStatisticsAjax.abort();
    LoginUserActiveStatisticsAjax = $.ajax({
        url: '/rest/login/user/active/statistics/' + user_id + '/' + type,
        type: 'get',
        dataType: 'json',
        data: loginInfoObj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,status) => {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.login.last.failed', '获取用户最近登录统计信息失败'));
            }
        }
    });
    return Deferred.promise();
};