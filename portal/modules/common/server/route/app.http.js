module.exports = {
    module: 'common/server/action/app',
    routes: [{
        //根据当前用户数据权限，获取应用列表
        'method': 'get',
        'path': '/rest/global/grant_applications',
        'handler': 'getGrantApplications',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        //根据当前用户数据权限，获取“我的应用”列表
        'method': 'get',
        'path': '/rest/global/my_applications',
        'handler': 'getMyApplications',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        //路径 获取新增用户的团队统计
        'method': 'get',
        'path': '/rest/new/user/team',
        'handler': 'getAddedTeam',
        'passport': {
            'needLogin': true
        }
    }, {
        //路径 获取当前应用的在线用户的地域数据
        'method': 'get',
        'path': '/rest/user/online/zone',
        'handler': 'getOnLineUserZone',
        'passport': {
            'needLogin': true
        }
    },{//获取各应用的默认配置
        'method': 'get',
        'path': '/rest/global/apps/default_config',
        'handler': 'getAppsDefaultConfig',
        'passport': {
            'needLogin': true
        }
    }]
};