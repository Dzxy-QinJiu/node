/**
 * Created by xiaojinfeng on 2016/04/08.
 */
'use strict';

/**
 * 请求路径 - login
 */

module.exports = {
    module: 'sales_team/server/action/sales-team-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/filter/sales_team_list/:user_name',
        'handler': 'filterSalesTeamList',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/team/sales_goals/:team_id',
        'handler': 'getSalesGoals',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/team/sales_goals',
        'handler': 'saveSalesGoals',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/member_list',
        'handler': 'getMemberList',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/sales_team_member',
        'handler': 'addMember',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': '/rest/sales_team_member',
        'handler': 'editMember',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'delete',
        'path': '/rest/sales_team/:group_id',
        'handler': 'deleteGroup',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/sales_team',
        'handler': 'addGroup',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': '/rest/sales_team',
        'handler': 'editGroup',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/get/organization/info',
        'handler': 'getOrganizationInfoByName',
        'passport': {
            'needLogin': true
        }
    }]
};
