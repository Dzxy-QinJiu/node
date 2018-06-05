/*
 * 获取销售人员列表
 */

module.exports = {
    module: 'common/server/action/salesman',
    routes: [{
        'method': 'get',
        'path': '/rest/base/v1/group/childgroupusers',
        'handler': 'getSalesmanList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }]
};