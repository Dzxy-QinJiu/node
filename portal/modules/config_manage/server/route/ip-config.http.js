import privilegeConfig_industry from '../../../industry/public/privilege-config';

/**
 * IP配置的路径
 * */
require('../action/ip-config-controller');

module.exports = {
    module: 'config_manage/server/action/ip-config-controller',
    routes: [
        {
            // 获取IP配置
            'method': 'get',
            'path': '/rest/get/ip_config',
            'handler': 'getIpConfigList',
            'passport': {
                'needLogin': true
            },
            'privileges': [
                'GET_CONFIG_IP' // 获取IP配置权限
            ]
        }, {
            // 添加IP配置
            'method': 'post',
            'path': '/rest/add/ip_config',
            'handler': 'addIpConfigItem',
            'passport': {
                'needLogin': true
            },
            'privileges': [
                privilegeConfig_industry.ORGANIZATION_CONFIG // 添加IP配置权限
            ]
        }, {
            // 删除IP配置
            'method': 'delete',
            'path': '/rest/delete/ip_config/:id',
            'handler': 'deleteIpConfigItem',
            'passport': {
                'needLogin': true
            },
            'privileges': [
                privilegeConfig_industry.ORGANIZATION_CONFIG // 删除IP配置权限
            ]
        }, {
            // 添加过滤内网ip
            'method': 'post',
            'path': '/rest/filter/lan',
            'handler': 'filterIp',
            'passport': {
                'needLogin': true
            },
            'privileges': [
                privilegeConfig_industry.ORGANIZATION_CONFIG // 添加过滤内网网段的权限
            ]
        }, {
            // 获取安全域是否过滤内网网段
            'method': 'get',
            'path': '/rest/get/config/filter/ip',
            'handler': 'getFilterIp',
            'passport': {
                'needLogin': true
            },
            'privileges': [
                'GET_CONFIG_IP' // 获取安全域是否过滤内网网段的权限
            ]
        }
    ]
};