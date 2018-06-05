/**
 * author:周连毅
 * 说明：统计分析-当前安全域-开通个数统计 rest路由文件
 */

module.exports = {
    //controller
    module: 'oplate_bd_analysis_realm_establish/server/action/realm-establish-controller',
    routes: [{
        //请求方式为get
        'method': 'get',
        //请求路径
        'path': '/rest/analysis/realm-establish',
        //处理函数
        'handler': 'getRealmEstablishData',
        //是否登录
        'passport': {
            'needLogin': true
        },
        //需要的权限
        'privileges': [
            'OPLATE_BD_ANALYSIS_REALM_ESTABLISH'
        ]
    }]
};