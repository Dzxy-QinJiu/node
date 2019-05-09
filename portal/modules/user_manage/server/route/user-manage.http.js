var UserManageController = require('../action/user-manage-controller');

/**
 * 请求路径 - login
 */

module.exports = {
    module: 'user_manage/server/action/user-manage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/user/log_list',
        'handler': 'getLogList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_LIST_LOG'
        ]
    }, {
        'method': 'get',
        'path': '/rest/user',
        'handler': 'getCurUserList',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/user/id/:user_id',
        'handler': 'getCurUserById',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        'method': 'post',
        'path': '/rest/user',
        'handler': 'addUser',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_ADD_USER'
        ]
    }, {
        'method': 'put',
        'path': '/rest/user',
        'handler': 'editUser',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'UPDATE_MEMBER_BASE_INFO'
        ]
    },{
        'method': 'put',
        'path': '/rest/user/user_team/:user_id/:group_id',
        'handler': 'updateUserTeam',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_EDIT_USER'
        ]
    }, {
        'method': 'put',
        'path': '/rest/user/user_roles',
        'handler': 'updateUserRoles',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'UPDATE_MEMBER_ROLE'
        ]
    }, {
        'method': 'put',
        'path': '/rest/user/status',
        'handler': 'updateUserStatus',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_EDIT_USER'
        ]
    }, {
        'method': 'get',
        'path': '/rest/user/roles',
        'handler': 'getRoleList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            //"USER_MANAGE_LIST_USERS"
            //没办法，创建用户的时候，要指定权限和角色，需要获取权限组，管理员可能没有这个权限
        ]
    }, {
        'method': 'get',
        'path': '/rest/nickname/:nickname',
        'handler': 'checkOnlyNickName',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_LIST_USERS'
        ]
    }, {
        'method': 'get',
        'path': '/rest/user_name/:username',
        'handler': 'checkOnlyUserName',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_LIST_USERS'
        ]
    }, {
        'method': 'get',
        'path': '/rest/user_phone/:phone',
        'handler': 'checkOnlyPhone',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_LIST_USERS'
        ]
    }, {
        'method': 'get',
        'path': '/rest/user_email/:email',
        'handler': 'checkOnlyEmail',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_LIST_USERS'
        ]
    }, {
        'method': 'get',
        'path': '/rest/get/contract/goal/users',
        'handler': 'getSalesGoals',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/set/contract/goal/users',
        'handler': 'setSalesGoals',
        'passport': {
            'needLogin': true
        }
    }]
};