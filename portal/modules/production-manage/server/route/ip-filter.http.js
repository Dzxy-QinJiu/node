/**
 * Created by hzl on 2019/10/17.
 * IP配置的路径
 */

module.exports = {
    module: 'production-manage/server/action/ip-filter-controller',
    routes: [
        {
            // 获取IP配置
            'method': 'get',
            'path': '/rest/get/ip',
            'handler': 'getIpList',
            'passport': {
                'needLogin': true
            }
        }, {
            // 添加IP配置
            'method': 'post',
            'path': '/rest/add/ip',
            'handler': 'addIp',
            'passport': {
                'needLogin': true
            }
        }, {
            // 删除IP
            'method': 'delete',
            'path': '/rest/delete/ip/:id',
            'handler': 'deleteIp',
            'passport': {
                'needLogin': true
            }
        }, {
            // 获取安全域过滤内网网段
            'method': 'get',
            'path': '/rest/get/private/ip',
            'handler': 'getFilterPrivateIp',
            'passport': {
                'needLogin': true
            }
        }, {
            // 设置全域过滤内网网段
            'method': 'post',
            'path': '/rest/set/private/ip',
            'handler': 'setFilterPrivateIp',
            'passport': {
                'needLogin': true
            }
        }
    ]
};