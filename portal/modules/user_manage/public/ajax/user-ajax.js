//获取用户的个人日志
exports.getLogList = function(condition) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/log_list',
        dataType: 'json',
        type: 'get',
        data: condition,
        success: function(logList) {
            Deferred.resolve(logList);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取当前页的用户列表
exports.getCurUserList = function(searchObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user',
        dataType: 'json',
        type: 'get',
        data: searchObj,
        success: function(userListObj) {
            Deferred.resolve(userListObj);
        },
        error: function(xhr, textStatus) {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//获取当前用户的详细信息
exports.getCurUserById = function(userId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/id/' + userId,
        dataType: 'json',
        type: 'get',
        success: function(userObj) {
            Deferred.resolve(userObj);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};


//添加用户
exports.addUser = function(user) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user',
        dataType: 'json',
        type: 'post',
        data: user,
        success: function(userCreated) {
            Deferred.resolve(userCreated);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改用户
exports.editUser = function(user) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user',
        dataType: 'json',
        type: 'put',
        data: user,
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改成员的所属团队
exports.updateUserTeam = function(user) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/user_team/' + user.id + '/' + user.team,
        dataType: 'json',
        type: 'put',
        success: function(userModified) {
            Deferred.resolve(userModified);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改成员的角色
exports.updateUserRoles = function(user) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/user_roles',
        dataType: 'json',
        type: 'put',
        data: {user_id: user.id, role_ids: JSON.stringify(user.role)},
        success: function(userModified) {
            Deferred.resolve(userModified);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//启停用户
exports.updateUserStatus = function(user) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/status',
        dataType: 'json',
        type: 'put',
        data: user,
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取角色列表
exports.getRoleList = function(clientId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/roles/' + clientId,
        type: 'get',
        success: function(roleList) {
            Deferred.resolve(roleList);
        }
    });
    return Deferred.promise();
};

//验证昵称（对应的是姓名）唯一性
exports.checkOnlyNickName = function(nickName) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/nickname/' + nickName,
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//验证用户名唯一性
exports.checkOnlyUserName = function(username) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_name/' + username,
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};


//验证电话唯一性
exports.checkOnlyPhone = function(phone) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_phone/' + phone,
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//验证邮箱唯一性
exports.checkOnlyEmail = function(email) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_email/' + email,
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取销售目标和提成比例
exports.getSalesGoals = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/contract/goal/users',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(list) {
            Deferred.resolve(list);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
//设置销售目标或者提成比例
exports.setSalesGoals = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/set/contract/goal/users',
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function(list) {
            Deferred.resolve(list);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};