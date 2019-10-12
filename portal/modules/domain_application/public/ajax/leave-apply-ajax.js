/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
//通过或者驳回申请
let approveLeaveApplyPassOrRejectAjax = null;
exports.approveLeaveApplyPassOrReject = function(obj) {
    var Deferred = $.Deferred();
    approveLeaveApplyPassOrRejectAjax && approveLeaveApplyPassOrRejectAjax.abort();
    approveLeaveApplyPassOrRejectAjax = $.ajax({
        url: '/rest/leave_apply/submitApply',
        dataType: 'json',
        type: 'post',
        data: obj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//添加自定义申请
exports.addSelfSettingApply = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/add/self_setting/apply',
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//校验二级域名是否存在
exports.checkDomainExist = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/check/domain/name',
        dataType: 'json',
        type: 'get',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};