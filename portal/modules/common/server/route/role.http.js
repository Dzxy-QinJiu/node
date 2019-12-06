import privilegeConst_common from '../../public/privilege-const';

module.exports = {
    module: 'common/server/action/role',
    routes: [{
        //获取角色列表
        'method': 'get',
        'path': '/rest/global/roles/:app_id',
        'handler': 'getRolesByAppId',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_APPLICATION]
    },{
        //获取权限列表
        'method': 'get',
        'path': '/rest/global/privileges/:app_id',
        'handler': 'getPrivilegeGroupsByAppId',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_APPLICATION]
    }]
};