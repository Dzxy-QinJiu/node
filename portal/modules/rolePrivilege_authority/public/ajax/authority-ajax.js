var TYPE_CONSTANT = "myApp";
//获取权限列表
exports.getAuthorityList = function(clientID, type) {
    var Deferred = $.Deferred();
    var getAutorityListUrl = '/rest/authority/';
    if (type === TYPE_CONSTANT) {
        getAutorityListUrl = '/rest/my_app/authority/';
    }
    $.ajax({
        url: getAutorityListUrl + clientID,
        dataType: 'json',
        type: 'get',
        success: function(obj) {
            Deferred.resolve(obj);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改权限分组名称
exports.editAuthorityGroupName = function(authorityGroup, type) {
    var Deferred = $.Deferred();
    var editAuthorityGroupListUrl = '/rest/authority_group_name/';
    if (type === TYPE_CONSTANT) {
        editAuthorityGroupListUrl = '/rest/my_app/authority_group_name/';
    }
    $.ajax({
        url: editAuthorityGroupListUrl,
        dataType: 'json',
        type: 'put',
        data: authorityGroup,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//添加权限
exports.addAuthority = function(authority, type) {
    var Deferred = $.Deferred();
    var addAutorityListUrl = '/rest/authority';
    if (type === TYPE_CONSTANT) {
        addAutorityListUrl = '/rest/my_app/authority';
    }
    $.ajax({
        url: addAutorityListUrl,
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(authority),
        success: function(authorityCreated) {
            Deferred.resolve(authorityCreated);
        },
        error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改权限
exports.editAuthority = function(authority, type) {
    var Deferred = $.Deferred();
    var editAutorityListUrl = '/rest/authority';
    if (type === TYPE_CONSTANT) {
        editAutorityListUrl = '/rest/my_app/authority';
    }
    $.ajax({
        url: editAutorityListUrl,
        dataType: 'json',
        type: 'put',
        data: authority,
        success: function(authorityModified) {
            Deferred.resolve(authorityModified);
        },
        error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除权限
exports.deleteAuthority = function(authorityIds, type) {
    var Deferred = $.Deferred();
    var delAuthorityListUrl = '/rest/authority/del';
    if (type === TYPE_CONSTANT) {
        delAuthorityListUrl = '/rest/my_app/authority/del';
    }
    $.ajax({
        url: delAuthorityListUrl,
        type: 'post',
        data: {authorityIds: authorityIds},
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};