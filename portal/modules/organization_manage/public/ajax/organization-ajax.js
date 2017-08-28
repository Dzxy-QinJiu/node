/**
 * Created by wangliping on 2016/10/18.
 */
//用户列表ajax请求返回值
var userListAjax = null;
exports.getOrganizationList = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/organization_list',
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.getOrganizationMemberList = function (groupId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/organization_member_list/' + groupId,
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
exports.getMemberList = function (queryObj) {
    if (userListAjax) {
        userListAjax.abort();
    }
    var Deferred = $.Deferred();
    userListAjax = $.ajax({
        url: '/rest/organization_member_list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (error, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(Intl.get("organization.get.add.organization.member.list.failed"));
            }
        }
    });
    return Deferred.promise();
};

exports.addMember = function (obj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/organization_member',
        dataType: 'json',
        contentType: 'application/json',
        type: 'post',
        data: JSON.stringify(obj),
        success: function (data) {
            Deferred.resolve(data);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};


exports.editMember = function (obj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/organization_member',
        dataType: 'json',
        contentType: 'application/json',
        type: 'put',
        data: JSON.stringify(obj),
        success: function (list) {
            Deferred.resolve(list);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//添加组织
exports.addGroup = function (organization) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/organization',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(organization),
        success: function (organizationCreated) {
            Deferred.resolve(organizationCreated);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改组织
exports.editGroup = function (organization) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/organization',
        dataType: 'json',
        type: 'put',
        data: organization,
        success: function (organizationModified) {
            Deferred.resolve(organizationModified);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除组织
exports.deleteGroup = function (groupId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/organization/' + groupId,
        type: 'delete',
        success: function (data) {
            Deferred.resolve(data);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};


