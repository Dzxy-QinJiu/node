/**
 * 请求路径 - login
 */

module.exports = {
    module: 'member_manage/server/action/member-manage-controller',
    routes: [{
        // 获取成员列表
        'method': 'get',
        'path': '/rest/user',
        'handler': 'getMemberList',
        'passport': {
            'needLogin': true
        }
    },{
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
            'USER_MANAGE_EDIT_USER'
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
        'method': 'delete',
        'path': '/rest/member/department/reset/:memberId',
        'handler': 'clearMemberDepartment',
        'passport': {
            'needLogin': true
        },
    },{
        'method': 'put',
        'path': '/rest/user/user_roles',
        'handler': 'updateUserRoles',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_MANAGE_EDIT_USER'
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
    }, {
        'method': 'get', // 获取成员变动记录
        'path': '/rest/get/member/record/timeline',
        'handler': 'getMemberChangeRecord',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get', // 根据不同角色获取不同的用户列表
        'path': '/rest/get/member/by/roles',
        'handler': 'getMemberListByRoles',
        'passport': {
            'needLogin': true
        }
    }, {
        // 获取成员的组织信息
        'method': 'get',
        'path': '/rest/get/member/organization',
        'handler': 'getMemberOrganization',
        'passport': {
            'needLogin': true
        }
    }]
};
