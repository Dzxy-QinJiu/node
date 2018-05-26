var trans = $.ajaxTrans();
//根据当前成员的角色，获取成员列表
trans.register('getUserListByRole', {url: '/rest/user_list/byrole', type: 'get'});
//根据成员id，获取成员信息
trans.register('getUserById', {url: '/rest/global/user/:user_id', type: 'get'});

//根据当前成员的角色，获取成员列表
exports.getUserListByRoleAjax = function() {
    return trans.getAjax('getUserListByRole');
};

//根据用户id，获取成员信息
exports.getUserByIdAjax = function() {
    return trans.getAjax('getUserById');
};
