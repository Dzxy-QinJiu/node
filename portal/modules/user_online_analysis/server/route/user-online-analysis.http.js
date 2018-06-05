//在线用户统计
module.exports = {
    module: 'user_online_analysis/server/action/user-online-analysis-controller',
    routes: [{
        'method': 'get',
        //获取在线用户概括信息的列表
        'path': '/rest/online/analysis/summary/:page_size/:page',
        'handler': 'getOnlineAnalysisSummary',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'OPLATE_ONLINE_USER_ANALYSIS'//用户在线统计
        ]
    },{
        'method': 'get',
        //获取某个应用的在线用户浏览器信息
        'path': '/rest/online/analysis/browser/:app_id',
        'handler': 'getOnlineBrowserByApp',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'OPLATE_ONLINE_USER_ANALYSIS'//用户在线统计
        ]
    },{
        'method': 'get',
        //获取某个应用的地域信息
        'path': '/rest/online/analysis/zone/:app_id',
        'handler': 'getOnlineZoneByApp',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'OPLATE_ONLINE_USER_ANALYSIS'//用户在线统计
        ]
    }]
};