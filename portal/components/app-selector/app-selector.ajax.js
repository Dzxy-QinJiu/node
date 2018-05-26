//根据应用获取角色列表
exports.getRoleList = function(appId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/roles/' + appId,
        dataType: 'json',
        type: 'get',
        data: {},
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg);
        }
    });
    return Deferred.promise();
};

//获取单个应用信息
exports.getAppInfo = function(appId) {
    var Def = $.Deferred();
    $.ajax({
        type : 'get',
        url : '/rest/app/' + appId ,
        dataType : 'json',
        success : function(info) {
            Def.resolve(info);
        },
        error : function(obj) {
            Def.reject(obj);
        }
    });
    return Def.promise();
};

//根据应用获取权限map
exports.getPermissionMap = function(appId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/authority/' + appId,
        dataType: 'json',
        type: 'get',
        data: {},
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg);
        }
    });
    return Deferred.promise();
};