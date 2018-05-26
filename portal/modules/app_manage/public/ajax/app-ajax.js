var userAjaxTrans = require("../../../../modules/common/public/ajax/user");
//获取当前页的应用列表
var curAppListAjax = null;

exports.getCurAppList = function(searchObj) {

    var Deferred = $.Deferred();

    curAppListAjax && curAppListAjax.abort();

    curAppListAjax = $.ajax({
        url: '/rest/app',
        dataType: 'json',
        type: 'get',
        data: searchObj,
        success: function(appList) {
            Deferred.resolve(appList);
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
        url: '/rest/app/' + appId,
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

//获取应用所有者、管理员列表
exports.getAppUserList = function(roleType) {
    var Deferred = $.Deferred();
    userAjaxTrans.getUserListByRoleAjax().sendRequest({role_type: roleType}).
        success(function(userList) {
            Deferred.resolve(userList);
        }).error(function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        });
    return Deferred.promise();
};


//添加应用
exports.addApp = function(app) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/app',
        dataType: 'json',
        type: 'post',
        data: app,
        success: function(appCreated) {
            Deferred.resolve(appCreated);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改应用
exports.editApp = function(app) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/app',
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