/**
 * * 请求路径
 */
require('../action/app-notice-controller');

module.exports = {
    module: 'my_app_manage/server/action/app-notice-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/get_app/notice',
        'handler': 'getAppNoticeList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'GET_APPLICATION_NOTICE' // 查看应用系统公告
        ]
    }, {
        'method': 'post',
        'path': '/rest/add_app/notice',
        'handler': 'addAppNotice',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'ADD_APPLICATION_NOTICE' // 添加应用系统公告
        ]
    }]
};