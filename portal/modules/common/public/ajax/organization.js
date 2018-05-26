var trans = $.ajaxTrans();
//获取组织下拉列表
trans.register('organization_list' , {url: '/rest/global/organization_list',type: 'get'});
//获取组织下拉列表
exports.getOrganizationListAjax = function() {
    return trans.getAjax("organization_list");
};
