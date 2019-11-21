import privilegeConfig_industry from '../../../industry/public/privilege-config';

require('../action/industry_manage.action');
module.exports = {
    module: 'config_manage/server/action/industry_manage.action',
    routes: [{
        'method': 'get',
        'path': '/rest/industries',
        'handler': 'getIndustries',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'GET_CONFIG_INDUSTRY' // 获取行业配置权限
        ]
    },{
        'method': 'post',
        'path': '/rest/add_industries',
        'handler': 'addIndustries',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            privilegeConfig_industry.ORGANIZATION_CONFIG // 添加行业配置权限
        ]
    },{
        'method': 'delete',
        'path': '/rest/delete_industries/:delete_id',
        'handler': 'deleteIndustries',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            privilegeConfig_industry.ORGANIZATION_CONFIG // 删除行业配置权限
        ]
    }
    ]
};
