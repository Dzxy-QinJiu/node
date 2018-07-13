/**
 * Created by wangliping on 2016/3/4.
 * * 请求路径 - app
 */
require('../action/app-manage-controller');

module.exports = {
    module: 'app_manage/server/action/app-manage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/app',
        'handler': 'getCurAppList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        'method': 'get',
        'path': '/rest/app/:app_id',
        'handler': 'getCurAppById',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            //"APP_MANAGE_LIST_APPS"
            //有一个需求：获取一个app_id对应的logo
            //如果限制了权限，产品总经理看在线用户统计的时候，将不能显示应用logo
        ]
    }, {
        'method': 'post',
        'path': '/rest/app',
        'handler': 'addApp',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'APP_MANAGE_LIST_APPS'
        ]
    }, {
        'method': 'put',
        'path': '/rest/app',
        'handler': 'editApp',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'APP_MANAGE_EDIT_APP'
        ]
    }]
};