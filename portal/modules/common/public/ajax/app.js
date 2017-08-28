var trans = $.ajaxTrans();
//根据当前用户数据权限，获取应用列表
trans.register('grantApplicationList' , {url : '/rest/global/grant_applications',type : 'get'});
//根据当前用户数据权限，获取“我的应用”列表
trans.register('ownerAppList' , {url : '/rest/global/my_applications' , type : 'get'});

//暴露方法 获取应用列表
exports.getGrantApplicationListAjax = function() {
    return trans.getAjax('grantApplicationList');
};

//暴露方法 获取我的应用列表
exports.getOwnerAppListAjax = function() {
    return trans.getAjax('ownerAppList');
};


