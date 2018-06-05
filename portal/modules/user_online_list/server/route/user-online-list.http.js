//在线用户列表
module.exports = {
    module: 'user_online_list/server/action/user-online-list-controller',
    routes: [{
        'method': 'post',
        'path': '/rest/online/list/:pageSize/:pageNum',
        'handler': 'getOnlineUserList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'OPLATE_ONLINE_USER_LIST'//用户在线列表
        ]
    }, {
        method: 'post',
        path: '/rest/online/kick_user',
        handler: 'kickUser',
        passport: {
            needLogin: true
        },
        privileges: [
            'USER_KICKOUT' // 踢出用户下线
        ]
    }]
};