/**
 * Created by hzl on 2019/10/17.
 */

// 获取IP列表
let IpListAjax = null;
exports.getIpList = (queryObj) => {
    let Deferred = $.Deferred();
    IpListAjax && IpListAjax.abort();
    IpListAjax = $.ajax({
        url: '/rest/get/ip',
        type: 'get',
        dateType: 'json',
        data: queryObj,
        success: (resData) => {
            Deferred.resolve(resData);
        },
        error: (xhr, state) => {
            if('abort' !== state){
                Deferred.reject(xhr.responseJSON || Intl.get('config.manage.get.ip.failed', '获取配置IP失败！') );
            }
        }
    });
    return Deferred.promise();
};

// 添加IP
exports.addIp = (addIpObj) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/add/ip',
        type: 'post',
        dataType: 'json',
        data: addIpObj,
        success: (resData) => {
            Deferred.resolve(resData);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('config.manage.add.ip.failed', '添加配置IP失败！'));
        }
    });
    return Deferred.promise();
};

/**
 * 删除IP
 * */
exports.deleteIp = (id) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/delete/ip/' + id,
        type: 'delete',
        success: (resData) => {
            Deferred.resolve(resData);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('config.manage.del.ip.failed', '删除配置IP失败！'));
        }
    });
    return Deferred.promise();
};

// 获取安全域过滤内网网段
exports.getFilterPrivateIp = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/private/ip',
        type: 'get',
        success: (resData) => {
            Deferred.resolve(resData);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('common.get.filter.ip.err', '获取过滤内网失败！'));
        }
    });
    return Deferred.promise();
};

// 设置全域过滤内网网段
exports.setFilterPrivateIp = (setStatus) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/set/private/ip',
        type: 'post',
        dataType: 'json',
        data: setStatus,
        success: (resData) => {
            Deferred.resolve(resData);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('config.filter.inner.ip.failed', '过滤内网ip失败！'));
        }
    });
    return Deferred.promise();
};
