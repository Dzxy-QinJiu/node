/**
 * Created by wangliping on 2018/3/1.
 */

module.exports = {
    module: 'office_manage/server/action/office-manage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/sales/role_list',
        'handler': 'getSalesRoleList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    },{
        'method': 'get',
        'path': '/rest/sales/role',
        'handler': 'getSalesRoleByMemberId',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    },{
        'method': 'post',
        'path': '/rest/sales/role',
        'handler': 'addSalesRole',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'TEAM_ROLE_MANAGE'
        ]
    },{
        'method': 'delete',
        'path': '/rest/sales/role/:role_id',
        'handler': 'deleteSalesRole',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'TEAM_ROLE_MANAGE'
        ]
    },{
        'method': 'put',
        'path': '/rest/sales/default_role/:role_id',
        'handler': 'setDefaultRole',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'TEAM_ROLE_MANAGE'
        ]
    },{
        'method': 'delete',
        'path': '/rest/sales/role/reset/:salesUserId',
        'handler': 'resetSalesRole',
        'passport': {
            'needLogin': false
        }, 'privileges': [
            'TEAM_ROLE_MANAGE'
        ]
    },{//修改销售的角色
        'method': 'post',
        'path': '/rest/sales/role/change',
        'handler': 'changeSalesRole',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'TEAM_ROLE_MANAGE'
        ]
    },{//设置某个角色的客户容量
        method: 'put',
        path: '/rest/sales/setting/customer',
        handler: 'setSalesRoleGoal',
        passport: {
            'needLogin': true
        },
        privileges: [
            'TEAM_ROLE_MANAGE'
        ]
    }, { // 编辑某个角色的名称/容量
        method: 'put',
        path: '/rest/sales/edit/role',
        handler: 'editPosition',
        passport: {
            'needLogin': true
        },
        privileges: ['TEAM_ROLE_MANAGE']
    }]
};
