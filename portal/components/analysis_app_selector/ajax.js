//获取应用列表
//根据权限判断，如果是产品总经理，调用我的应用接口
//如果是其他人，调用应用列表接口
//如果是产品总经理，不显示全部应用
var userData = require("../../public/sources/user-data");
var appAjaxTrans = require("../../modules/common/public/ajax/app");
exports.getAppList = function() {
    var Deferred = $.Deferred();
    var privileges = userData.getUserData().privileges || [];
    var hasAll = privileges.indexOf("APP_MANAGE_LIST_APPS") >= 0 || privileges.indexOf("USER_INFO_MYAPP") < 0;
    //调用统一的接口发请求
    appAjaxTrans.getGrantApplicationListAjax().sendRequest().
    success(function(list) {
        list = list.map(function(app) {
            return {
                id : app.app_id,
                name : app.app_name,
                image : app.app_logo
            };
        });
        Deferred.resolve({list :list , hasAll : hasAll});
    }).error(function() {
        Deferred.resolve({list :[] , hasAll : hasAll});
    }).timeout(function() {
        Deferred.resolve({list :[] , hasAll : hasAll});
    });

    return Deferred.promise();
};