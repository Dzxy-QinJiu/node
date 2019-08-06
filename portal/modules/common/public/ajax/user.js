var trans = $.ajaxTrans();
//根据当前成员的角色，获取成员列表
trans.register('getUserListByRole', {url: '/rest/user_list/byrole', type: 'get'});
//根据成员id，获取成员信息
trans.register('getUserById', {url: '/rest/global/user/:user_id', type: 'get'});

// 根据角色id，获取启用状态的下成员列表
trans.register('getEnableMemberListByRoleId', {url: '/rest/get/enable/member/by/role', type: 'get'});

//根据当前成员的角色，获取成员列表
exports.getUserListByRoleAjax = function() {
    return trans.getAjax('getUserListByRole');
};

//根据用户id，获取成员信息
exports.getUserByIdAjax = function() {
    return trans.getAjax('getUserById');
};

// 根据角色id，获取启用状态的下成员列表
exports.getEnableMemberListByRoleId = (reqParams) => {
    return trans.getAjax('getEnableMemberListByRoleId', reqParams);
};