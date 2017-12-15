var trans = $.ajaxTrans();
//根据当前用户数据权限，获取应用列表
trans.register('grantApplicationList' , {url : '/rest/global/grant_applications',type : 'get'});
//根据当前用户数据权限，获取“我的应用”列表
trans.register('ownerAppList' , {url : '/rest/global/my_applications' , type : 'get'});
// 获取各应用的默认配置（到期停用\不变\降级）
trans.register('appsDefaultConfig' , {url : '/rest/global/apps/default_config' , type : 'get'});

//暴露方法 获取应用列表
exports.getGrantApplicationListAjax = function() {
    return trans.getAjax('grantApplicationList');
};

//暴露方法 获取我的应用列表
exports.getOwnerAppListAjax = function() {
    return trans.getAjax('ownerAppList');
};

//暴露方法 获取各应用的默认设置,appIds:[1,2]
exports.getAppsDefaultConfigAjax = function(reqParams) {
    return trans.getAjax('appsDefaultConfig',reqParams);
};


