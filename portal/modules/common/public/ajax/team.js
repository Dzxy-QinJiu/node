var trans = $.ajaxTrans();
//获取所属团队及下级团队列表
trans.register('teamList', {url: '/rest/team/sales_team_list', type: 'get'});
//获取团队下的成员列表
trans.register('memberListByTeamId', {url: '/rest/sales_team_member_list/:group_id', type: 'get'});
//获取统计团队内成员个数的列表
trans.register('teamMemberCountList', {url: '/rest/team/member/count/list', type: 'get'});
//暴露方法 获取团队列表
exports.getTeamListAjax = function () {
    return trans.getAjax('teamList');
};
//获取团队下的成员列表
exports.getMemberListByTeamIdAjax = function (params) {
    return trans.getAjax('memberListByTeamId', params);
};
//获取统计团队内成员个数的列表
exports.getTeamMemberCountListAjax = function () {
    return trans.getAjax('teamMemberCountList');
};
