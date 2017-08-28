//查询安全域密码策略
exports.getRealmStrategy = function(){    
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/getRealmStrategy',
        type: 'get',
        dataType: 'json',
        // data: param,
        success: function(resData){
            Deferred.resolve(resData);
        },
        error: function(errorInfo){
            Deferred.reject(errorInfo.responseJSON || Intl.get("config.manage.get.realm.failed", "获取密码策略失败！"));
        }
    });
    return Deferred.promise();
};

//设置安全域密码策略
exports.updateRealmStrategy = function(param){    
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/setRealmStrategy',
        type: 'post',
        dataType: 'json',
        data: param,
        success: function(resData){
            Deferred.resolve(resData);
        },
        error: function(errorInfo){
            Deferred.reject(errorInfo.responseJSON || Intl.get("config.manage.set.realm.failed", "设置密码策略失败！"));
        }
    });
    return Deferred.promise();
};
