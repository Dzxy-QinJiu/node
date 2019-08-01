import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
let userData = require('PUB_DIR/sources/user-data');

var trans = $.ajaxTrans();
//根据当前成员的角色，获取成员列表
trans.register('getUserListByRole', {url: '/rest/user_list/byrole', type: 'get'});
//根据成员id，获取成员信息
trans.register('getUserById', {url: '/rest/global/user/:user_id', type: 'get'});
//获取在团队树中的成员
trans.register('getUserInTeamTree', {url: '/rest/base/v1/group/team/members/' + commonMethodUtil.getParamByPrivilege().type, type: 'get'});
//获取所有成员
trans.register('getAllUser', {url: '/rest/base/v1/user?page_size=9999', type: 'get'});

//根据当前成员的角色，获取成员列表
exports.getUserListByRoleAjax = function() {
    return trans.getAjax('getUserListByRole');
};

//根据用户id，获取成员信息
exports.getUserByIdAjax = function() {
    return trans.getAjax('getUserById');
};

//获取用户列表
exports.getUserListAjax = function() {
    //若当前用户是销售角色
    if (userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
        //获取在团队树中的成员
        return trans.getAjax('getUserInTeamTree');
    //否则
    } else {
        //获取全部的成员
        return trans.getAjax('getAllUser');
    }
};
