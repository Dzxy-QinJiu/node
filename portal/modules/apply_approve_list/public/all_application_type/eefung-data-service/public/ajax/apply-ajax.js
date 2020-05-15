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
        url: '/rest/dataservice/submitApply',
        dataType: 'json',
        type: 'post',
        data: obj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg,status) {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
