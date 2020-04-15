/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
//通过或者驳回申请
let approveSalesOpportunityApplyPassOrRejectAjax = null;
exports.approveSalesOpportunityApplyPassOrReject = function(obj) {
    var Deferred = $.Deferred();
    approveSalesOpportunityApplyPassOrRejectAjax && approveSalesOpportunityApplyPassOrRejectAjax.abort();
    approveSalesOpportunityApplyPassOrRejectAjax = $.ajax({
        url: '/rest/sales_opportunity_apply/submitApply',
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

