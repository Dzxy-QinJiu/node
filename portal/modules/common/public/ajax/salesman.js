/*
 * 获取销售人员列表
 */

const url = '/rest/base/v1/group/childgroupusers';
const trans = $.ajaxTrans();
trans.register('salesmanList', {url: url, type: 'get'});
trans.register('teamAllMembersList', {url: '/get/team/memberlists/:type', type: 'get'});
//filter_manager:是否过滤团队管理员（舆情秘书）
exports.getSalesmanListAjax = function(filter_manager) {
    return trans.getAjax('salesmanList', {filter_manager: filter_manager ? true : false});
};
exports.getMyTeamTreeMemberListAjax = function(params) {
    return trans.getAjax('teamAllMembersList', params);
};

