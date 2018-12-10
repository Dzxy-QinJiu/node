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
//根据申请的id获取申请的详情
let getSalesOpportunityApplyDetailByIdAjax = null;
exports.getSalesOpportunityApplyDetailById = function(queryObj) {
    var Deferred = $.Deferred();
    getSalesOpportunityApplyDetailByIdAjax && getSalesOpportunityApplyDetailByIdAjax.abort();
    getSalesOpportunityApplyDetailByIdAjax = $.ajax({
        url: '/rest/sales_opportunity_apply/detail/byId',
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
//获取回复列表
let getSalesOpportunityApplyCommentListAjax = null;
exports.getSalesOpportunityApplyCommentList = function(queryObj) {
    var Deferred = $.Deferred();
    getSalesOpportunityApplyCommentListAjax && getSalesOpportunityApplyCommentListAjax.abort();
    getSalesOpportunityApplyCommentListAjax = $.ajax({
        url: '/rest/get/sales_opportunity_apply/comment/list',
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
//添加审批回复
let addSalesOpportunityApplyCommentsAjax = null;
exports.addSalesOpportunityApplyComments = function(data) {
    var Deferred = $.Deferred();
    addSalesOpportunityApplyCommentsAjax && addSalesOpportunityApplyCommentsAjax.abort();
    addSalesOpportunityApplyCommentsAjax = $.ajax({
        url: '/rest/add/sales_opportunity_apply/comment',
        dataType: 'json',
        type: 'post',
        data: data,
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
//获取某个申请的状态
let getSalesOpportunityApplyStatusByIdAjax = null;
exports.getSalesOpportunityApplyStatusById = function(queryObj) {
    var Deferred = $.Deferred();
    getSalesOpportunityApplyStatusByIdAjax && getSalesOpportunityApplyStatusByIdAjax.abort();
    getSalesOpportunityApplyStatusByIdAjax = $.ajax({
        url: '/rest/get/apply/status/byId',
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
//撤销某个申请审批
exports.cancelApplyApprove = function(obj) {
    const ERROR_MSG = Intl.get('user.apply.detail.backout.error', '撤销申请失败');
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/cancel/apply/approve',
        type: 'post',
        dataType: 'json',
        data: obj,
        success: function(result) {
            //操作成功返回true
            if(result === true) {
                Deferred.resolve(result);
            } else {
                Deferred.reject(ERROR_MSG);
            }
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || ERROR_MSG);
        }
    });
    return Deferred.promise();
};
