import privilegeConst_common from '../../../user_info/public/privilege-config';

module.exports = {
    module: 'common/server/action/organization',
    routes: [{
        //获取组织列表
        'method': 'get',
        'path': '/rest/global/organization_list',
        'handler': 'getOrganizationList',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_MEMBER]
    },{
        //获取组织列表
        'method': 'put',
        'path': '/rest/global/organization/:user_id/:group_id',
        'handler': 'changeOrganization',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    },{
        //获取组织电话系统配置
        'method': 'get',
        'path': '/rest/global/callsystem/config',
        'handler': 'getCallSystemConfig',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_ORGANIZATION]
    },{
        //完善个人试用资料
        'method': 'put',
        'path': '/rest/global/organization/personal/trial/info',
        'handler': 'updatePersonalTrialInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }]
};