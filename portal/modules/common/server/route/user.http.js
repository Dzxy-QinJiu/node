import privilegeConst_common from '../../public/privilege-const';
module.exports = {
    module: 'common/server/action/user',
    routes: [{
        //根据角色获取成员列表
        'method': 'get',
        'path': '/rest/user_list/byrole',
        'handler': 'getUserListByRole',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_MEMBER]
    },{
        //根据成员id获取成员信息
        'method': 'get',
        'path': '/rest/global/user/:user_id',
        'handler': 'getUserById',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_MEMBER]
    }, { // 根据角色id，获取启用状态的下成员列表
        'method': 'get',
        'path': '/rest/get/enable/member/by/role',
        'handler': 'getEnableMemberListByRoleId',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }]
};