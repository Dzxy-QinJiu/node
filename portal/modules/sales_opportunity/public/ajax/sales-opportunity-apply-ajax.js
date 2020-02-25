/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
let salesmanAjax = require('../../../common/public/ajax/salesman');
//获取全部申请列表
let getAllSalesOpportunityApplyListAjax = null;
exports.getAllSalesOpportunityApplyList = function(queryObj) {
    var Deferred = $.Deferred();
    getAllSalesOpportunityApplyListAjax && getAllSalesOpportunityApplyListAjax.abort();
    getAllSalesOpportunityApplyListAjax = $.ajax({
        url: '/rest/get/all/sales_opportunity_apply/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取待我审批的申请列表
let getWorklistSalesOpportunityApplyListAjax = null;
exports.getWorklistSalesOpportunityApplyList = function(queryObj) {
    var Deferred = $.Deferred();
    getWorklistSalesOpportunityApplyListAjax && getWorklistSalesOpportunityApplyListAjax.abort();
    getWorklistSalesOpportunityApplyListAjax = $.ajax({
        url: '/rest/get/worklist/sales_opportunity_apply/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
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
//获取销售人员列表
exports.getSalesManList = function() {
    var Deferred = $.Deferred();
    salesmanAjax.getSalesmanListAjax().sendRequest({filter_manager: true})
        .success(list => {
            Deferred.resolve(list);
        }).error((xhr) => {//xhr:XMLHttpRequest
            Deferred.reject(xhr.responseJSON);
        });
    return Deferred.promise();
};
