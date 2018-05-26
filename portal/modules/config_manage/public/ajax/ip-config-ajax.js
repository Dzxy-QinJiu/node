/**
 * 获取ip配置的列表
 * */
var IpConfigListAjax = null;
exports.getIpConfigList = function(searchObj){
    var queryObj = {
        page_size: searchObj.pageSize
    };
    var Deferred = $.Deferred();
    IpConfigListAjax && IpConfigListAjax.abort();
    IpConfigListAjax = $.ajax({
        url: '/rest/get/ip_config',
        type: 'get',
        dateType: 'json',
        data: queryObj,
        success: function(resData){
            Deferred.resolve(resData);
        },
        error: function(xhr, state){
            if('abort' !== state){
                Deferred.reject(xhr.responseJSON || Intl.get("config.manage.get.ip.failed", "获取配置IP失败！") );
            }
        }
    });
    return Deferred.promise();
};

/**
 * 添加IP配置
 * */
exports.addIpConfigItem = function(addIpItem){
    var obj = {
        ip: addIpItem
    };
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/add/ip_config',
        type: 'post',
        dataType: 'json',
        data: obj,
        success: function(resData){
            Deferred.resolve(resData);
        },
        error: function(errorInfo){
            Deferred.reject(errorInfo.responseJSON || Intl.get("config.manage.add.ip.failed", "添加配置IP失败！"));
        }
    });
    return Deferred.promise();
};

/**
 * 删除IP配置
 * */
exports.deleteIpConfigItem = function(id){
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/delete/ip_config/' + id,
        type: 'delete',
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON || Intl.get("config.manage.del.ip.failed", "删除配置IP失败！"));
        }
    });
    return Deferred.promise();
};

/**
 * 添加配置过滤内网ip
 * */
exports.filterIp = function(status) {
    var Deferred = $.Deferred();
    
    let filterObj = {
        filter_lan: status
    };
    $.ajax({
        url: '/rest/filter/lan',
        type: 'post',
        dataType: 'json',
        data: filterObj,
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON || Intl.get("config.filter.inner.ip.failed", "过滤内网ip失败！"));
        }
    });
    return Deferred.promise();
};

// 获取配置过滤内网信息
exports.getFilterIp = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/config/filter/ip',
        type: 'get',
        success: function(resData){
            Deferred.resolve(resData);
        },
        error: function(errorInfo){
            Deferred.reject(errorInfo.responseJSON || Intl.get("common.get.filter.ip.err", "获取过滤内网失败！"));
        }
    });
    return Deferred.promise();
};