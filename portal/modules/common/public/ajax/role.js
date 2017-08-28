var trans = $.ajaxTrans();
//根据应用id，获取应用的角色
trans.register('getRolesByAppId' , {url : '/rest/global/roles/:app_id',type : 'get'});
//根据应用id，获取应用的权限
trans.register('getPrivilegeGroupsByAppId' , {url : '/rest/global/privileges/:app_id' , type : 'get'});

//暴露方法 根据应用id，获取应用的角色
exports.getRolesByAppId = function() {
    return trans.getAjax('getRolesByAppId');
};

//暴露方法 根据应用id，获取应用的权限组
exports.getPrivilegeGroupsByAppId = function() {
    return trans.getAjax('getPrivilegeGroupsByAppId');
};