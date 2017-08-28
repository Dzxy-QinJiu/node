var roleAjax = require("../../../modules/common/public/ajax/role");

//根据应用获取角色列表
exports.getRoleList = function(appId) {
    var Deferred = $.Deferred();
    roleAjax.getRolesByAppId().resolvePath({
        app_id : appId
    }).sendRequest({
        permission_ids : "true"
    }).success(function(data) {
        Deferred.resolve(data);
    }).error(function(xhr) {
        Deferred.reject(xhr.responseJSON);
    }).timeout(function(xhr) {
        Deferred.reject("获取角色列表超时");
    });
    return Deferred.promise();
};

//根据应用获取权限map
exports.getPermissionMap = function(appId) {
    var Deferred = $.Deferred();
    roleAjax.getPrivilegeGroupsByAppId().resolvePath({
        app_id : appId
    }).sendRequest().success(function(data) {
        Deferred.resolve(data);
    }).error(function(xhr) {
        Deferred.reject(xhr.responseJSON);
    }).timeout(function(xhr) {
        Deferred.reject("获取权限组信息失败");
    });
    return Deferred.promise();
};