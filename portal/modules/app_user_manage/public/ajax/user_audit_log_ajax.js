var appAjaxTrans = require("../../../common/public/ajax/app");

//获取审计日志用户的应用
exports.getUserApp = function(){
    var Deferred = $.Deferred();
    appAjaxTrans.getGrantApplicationListAjax().sendRequest().
    success(function(data) {
        Deferred.resolve(data);
    }).error(function(xhr, code , errText) {
        Deferred.resolve(xhr.responseJSON);
    }).timeout(function() {
        Deferred.resolve();
    });
    return Deferred.promise();
};

// 获取所有用户审计日志信息
var auditLogAjax = null;
exports.getAuditLogList = function(searchObj){
    var Deferred = $.Deferred();
    auditLogAjax && auditLogAjax.abort();
    auditLogAjax = $.ajax({
        url: '/rest/user/log',
        type: 'get',
        data : searchObj,
        dateType: 'json',
        success : function(data){
            Deferred.resolve(data);
        },
        error: function (xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON);
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
        data : searchObj,
        dateType: 'json',
        success : function(data){
            Deferred.resolve(data);
        },
        error: function (xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 根据单个用户user_id获取用户应用列表
var singleUserLogAppAjax = null;
exports.getSingleUserAppList = function(searchObj){
    let Deferred = $.Deferred();
    singleUserLogAppAjax && singleUserLogAppAjax.abort();
    singleUserLogAppAjax = $.ajax({
        url: '/rest/appuser/detail/'+ searchObj.user_id,
        type: 'get',
        dateType: 'json',
        success : function(data){
            Deferred.resolve(data);
        },
        error: function (xhr,status) {
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
    let loginInfoObj =  _.clone(queryobj);
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
        error: function (xhr,status) {
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
    let loginInfoChartObj =  _.clone(queryobj);
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
        error: function (xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.log.login.fail', '获取登录信息失败！'));
            }
        }
    });
    return Deferred.promise();
};