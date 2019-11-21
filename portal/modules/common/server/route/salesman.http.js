/*
 * 获取销售人员列表
 */
import privilegeConst_common from '../../public/privilege-const';
module.exports = {
    module: 'common/server/action/salesman',
    routes: [{
        'method': 'get',
        'path': '/rest/base/v1/group/childgroupusers',
        'handler': 'getSalesmanList',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_TEAM]
    },{
        'method': 'get',
        'path': '/get/team/memberlists/:type',
        'handler': 'getMyTeamTreeMemberList',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_TEAM]
    }]
};