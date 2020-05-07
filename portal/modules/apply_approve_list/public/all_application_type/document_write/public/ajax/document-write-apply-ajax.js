/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
//通过或者驳回申请
let approveApplyPassOrRejectAjax = null;
exports.approveApplyPassOrReject = function(obj) {
    var Deferred = $.Deferred();
    approveApplyPassOrRejectAjax && approveApplyPassOrRejectAjax.abort();
    approveApplyPassOrRejectAjax = $.ajax({
        url: '/rest/documentwrite/submitApply',
        dataType: 'json',
        type: 'post',
        data: obj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('fail.apply.approve.result','审批失败'));
            }
        }
    });
    return Deferred.promise();
};