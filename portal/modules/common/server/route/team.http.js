/**
 * Created by wangliping on 2017/4/13.
 */

'use strict';
import privilegeConst_common from '../../public/privilege-const';
module.exports = {
    module: 'common/server/action/team',
    routes: [{
        'method': 'get',
        'path': '/rest/sales_team_member_list/:group_id',
        'handler': 'getSalesTeamMemberList',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_TEAM]
    }, {
        'method': 'get',
        'path': '/rest/team/sales_team_list',
        'handler': 'getSalesTeamList',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_TEAM]
    }, {
        'method': 'get',
        'path': '/rest/team/member/count/list',
        'handler': 'getTeamMemberCountList',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_TEAM]
    },{
        'method': 'get',
        'path': '/rest/team/my_team/tree',
        'handler': 'getMyteamTreeList',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_TEAM]
    }]
};
