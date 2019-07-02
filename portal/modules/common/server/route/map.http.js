/** Created by 2019-07-01 19:41 */
module.exports = {
    module: 'common/server/action/map',
    routes: [{
        //查询所有行政区域规划信息
        'method': 'get',
        'path': '/rest/area_info/all',
        'handler': 'getAreaInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }]
};