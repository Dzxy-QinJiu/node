
exports.getTeleList = function(param) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/getTele',
        type: 'get',
        dataType: 'json',  
        data: param,
        success: function(result){
            Deferred.resolve(result);
        },
        error: function(errorInfo){
            Deferred.reject(errorInfo.responseJSON || Intl.get('config.manage.get.tele.failed', '查询客服电话失败！'));
        }
    });
    return Deferred.promise();
};

exports.addTele = function(param) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/addTele',
        type: 'post',
        dataType: 'json',  
        data: param,
        success: function(resData){
            Deferred.resolve(resData);
        },
        error: function(errorInfo){
            Deferred.reject(errorInfo.responseJSON || Intl.get('config.manage.add.tele.failed', '添加客服电话失败！'));
        }
    });
    return Deferred.promise();
};

exports.delTele = function(param) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/delTele',
        type: 'delete',
        dataType: 'json',
        data: param,
        success: function(resData){
            Deferred.resolve(resData);
        },
        error: function(errorInfo){
            Deferred.reject(errorInfo.responseJSON || Intl.get('config.manage.add.tele.failed', '删除客服电话失败！'));
        }
    });
    return Deferred.promise();
};
