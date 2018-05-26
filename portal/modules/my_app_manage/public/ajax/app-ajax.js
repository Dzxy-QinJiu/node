var userAjaxTrans = require("../../../../modules/common/public/ajax/user");
//获取当前页的应用列表
var myAppListAjax = null;

var appAjaxTrans = require("../../../common/public/ajax/app");

//获取密令app列表
exports.grantApplicationList = function() {
    var Deferred = $.Deferred();
    appAjaxTrans.getGrantApplicationListAjax().sendRequest().
        success(function(data) {
            Deferred.resolve(data);
        }).error(function(xhr) {
            Deferred.resolve(xhr.responseJSON);
        });
    return Deferred.promise();
};

exports.getMyAppList = function(searchObj) {

    var Deferred = $.Deferred();

    myAppListAjax && myAppListAjax.abort();

    myAppListAjax = $.ajax({
        url: '/rest/my_app_list',
        dataType: 'json',
        type: 'get',
        data: searchObj,
        success: function(userMyApp) {
            Deferred.resolve(userMyApp);
        },
        error: function(xhr, textStatus) {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//根据id获取app的详情
exports.getCurAppById = function(appId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/my_app/' + appId,
        dataType: 'json',
        type: 'get',
        success: function(app) {
            Deferred.resolve(app);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取应用管理员列表
exports.getAppManagerList = function() {
    var Deferred = $.Deferred();
    userAjaxTrans.getUserListByRoleAjax().sendRequest({role_type: "app_manager"}).
        success(function(userList) {
            Deferred.resolve(userList);
        }).error(function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        });
    return Deferred.promise();
};
//修改应用
exports.editApp = function(app) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/my_app',
        dataType: 'json',
        type: 'put',
        data: app,
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
//刷新应用密钥
exports.refreshAppSecret = function(appId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/my_app/refresh_secret/' + appId,
        dataType: 'json',
        type: 'put',
        success: function(appSecret) {
            Deferred.resolve(appSecret);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改应用到期时间
exports.updateAppExpireDate = function(app) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/my_app/expire_date',
        dataType: 'json',
        type: 'put',
        data: app,
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//根据id获取piwik字符串
exports.getCurAppKeyById = function(appId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/appcodetrace/' + appId,
        dataType: 'json',
        type: 'get',
        success: function(app) {
            Deferred.resolve(app);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
