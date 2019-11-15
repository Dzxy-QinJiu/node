import {getSalesTeamRoleList} from 'MOD_DIR/common/public/ajax/role';

// 获取成员列表
let memberListAjax = null;
exports.getMemberList = (searchObj) => {
    memberListAjax && memberListAjax.abort();
    let Deferred = $.Deferred();
    memberListAjax = $.ajax({
        url: '/rest/user',
        dataType: 'json',
        type: 'get',
        data: searchObj,
        success: (userListObj) => {
            Deferred.resolve(userListObj);
        },
        error: (xhr, textStatus) => {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 获取当前成员的详细信息
exports.getCurMemberById = (memberId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/id/' + memberId,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 修改成员的启停用状态
exports.updateMemberStatus = (member) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/status',
        dataType: 'json',
        type: 'put',
        data: member,
        success: (data) => {
            Deferred.resolve(data);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取用户的个人日志
exports.getLogList = function(condition) {
    let Deferred = $.Deferred();
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

//添加用户
exports.addUser = function(user) {
    let Deferred = $.Deferred();
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
    let Deferred = $.Deferred();
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

//修改成员的部门
exports.updateMemberTeam = function(user) {
    let Deferred = $.Deferred();
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

// 清空成员的部门
exports.clearMemberDepartment = (memberId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/member/department/reset/' + memberId,
        type: 'delete',
        dateType: 'json',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改成员的角色
exports.updateMemberRoles = (user) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/user_roles',
        dataType: 'json',
        type: 'put',
        data: {user_id: user.id, role_ids: JSON.stringify(user.role)},
        success: (userModified) => {
            Deferred.resolve(userModified);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取职务列表
exports.getSalesPosition = () => {
    let Deferred = $.Deferred();
    getSalesTeamRoleList().sendRequest().success((data) => {
        Deferred.resolve(data);
    }).error((xhr) => {
        Deferred.reject(xhr.responseJSON || Intl.get('user.log.login.fail', '获取职务列表失败！'));
    });
    return Deferred.promise();
};

// 成员设置职务
exports.setMemberPosition = (reqBody) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/role/change',
        type: 'post',
        dateType: 'json',
        data: reqBody,
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 添加职务
exports.addPosition = (reqBody) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/role',
        type: 'post',
        dateType: 'json',
        data: reqBody,
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON || Intl.get('member.add.failed', '添加失败！'));
        }
    });
    return Deferred.promise();
};


// 清空成员的职务
exports.clearMemberPosition = (memberId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/role/reset/' + memberId,
        type: 'delete',
        dateType: 'json',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取角色列表
exports.getRoleList = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/roles',
        type: 'get',
        success: (roleList) => {
            Deferred.resolve(roleList);
        }
    });
    return Deferred.promise();
};

//验证昵称（对应的是姓名）唯一性
exports.checkOnlyNickName = (nickName) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/nickname/' + nickName,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//验证用户名唯一性
exports.checkOnlyUserName = function(username) {
    let Deferred = $.Deferred();
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
    let Deferred = $.Deferred();
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
    let Deferred = $.Deferred();
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
    let Deferred = $.Deferred();
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
    let Deferred = $.Deferred();
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

// 获取成员变动记录
exports.getMemberChangeRecord = (queryObj) => {
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/member/record/timeline',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: (recordList) => {
            Deferred.resolve(recordList);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};