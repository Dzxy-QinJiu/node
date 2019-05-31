var trans = $.ajaxTrans();
//根据当前用户数据权限，获取应用列表
trans.register('grantApplicationList' , {url: '/rest/global/grant_applications',type: 'get'});

// 获取各应用的默认配置（到期停用\不变\降级）
trans.register('appsDefaultConfig' , {url: '/rest/global/apps/default_config' , type: 'get'});

//暴露方法 获取应用列表(isIntegration:是否只获取集成的产品)
exports.getGrantApplicationListAjax = function() {
    return trans.getAjax('grantApplicationList');
};

//暴露方法 获取各应用的默认设置,appIds:[1,2]
exports.getAppsDefaultConfigAjax = function(reqParams) {
    return trans.getAjax('appsDefaultConfig',reqParams);
};

// 获取用户查询条件
exports.getUserCondition = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/userquery/condition',
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('user.info.get.user.condition.failed', '获取用户查询条件失败'));
        }
    });
    return Deferred.promise();
};


