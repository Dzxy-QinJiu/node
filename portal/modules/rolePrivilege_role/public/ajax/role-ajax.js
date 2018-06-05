var TYPE_CONSTANT = 'myApp';
//获取角色列表
exports.getRoleList = function(clientID, type) {
    var Deferred = $.Deferred();
    var getRoleListUrl = '/rest/role_list/';
    if (type === TYPE_CONSTANT) {
        getRoleListUrl = '/rest/my_app/role_list/';
    }
    $.ajax({
        url: getRoleListUrl + clientID,
        dataType: 'json',
        type: 'get',
        success: function(listObj) {
            Deferred.resolve(listObj);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//添加角色
exports.addRole = function(role, type) {
    var Deferred = $.Deferred();
    var addRoleUrl = '/rest/role/';
    if (type === TYPE_CONSTANT) {
        addRoleUrl = '/rest/my_app/role/';
    }
    $.ajax({
        url: addRoleUrl,
        dataType: 'json',
        type: 'post',
        data: role,
        success: function(roleCreated) {
            Deferred.resolve(roleCreated);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//设置默认角色
exports.setDefaultRole = function(param) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/baserole/config',
        dataType: 'json',
        type: 'post',
        data: param,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(result) {
            Deferred.resolve(result);
        }
    });    
    return Deferred.promise();
};

//获取默认角色
exports.getDefaultRole = function(param) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/baserole/config',
        dataType: 'json',
        type: 'get',   
        data: param,     
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(result) {
            Deferred.reject(result);
        }
    });
    return Deferred.promise();
};

//删除默认角色
exports.delDefaultRole = function(param) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/baserole/config',
        dataType: 'json',
        type: 'delete',
        data: param,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(result) {
            Deferred.reject(result);
        }
    });
    return Deferred.promise();
};

//修改角色
exports.editRole = function(role, type) {
    var Deferred = $.Deferred();
    var editRoleUrl = '/rest/role/';
    if (type === TYPE_CONSTANT) {
        editRoleUrl = '/rest/my_app/role/';
    }
    $.ajax({
        url: editRoleUrl,
        dataType: 'json',
        type: 'put',
        data: role,
        success: function(roleModified) {
            Deferred.resolve(roleModified);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除角色
exports.deleteRole = function(roleId, type) {
    var Deferred = $.Deferred();
    var delRoleUrl = '/rest/role/';
    if (type === TYPE_CONSTANT) {
        delRoleUrl = '/rest/my_app/role/';
    }
    $.ajax({
        url: delRoleUrl + roleId,
        type: 'delete',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};