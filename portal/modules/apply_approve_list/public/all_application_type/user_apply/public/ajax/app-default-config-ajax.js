/**
 * 获取应用的角色和权限
 * */

// 根据用户类型和所申请的app_id,获取对应应用的默认配置权限
exports.getApplyAppDefaultInfo = function(obj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/usertypeconfig',
        dateType: 'json',
        data: obj,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON || Intl.get('user.apply.detail.get.config.failed', '获取应用默认配置失败！'));
        }
    });

    return Deferred.promise();
};