/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
//获取全部申请列表
let getAllApplyListAjax = null;
exports.getAllApplyList = function(queryObj) {
    var Deferred = $.Deferred();
    getAllApplyListAjax && getAllApplyListAjax.abort();
    getAllApplyListAjax = $.ajax({
        url: '/rest/get/all/business_apply/list',
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
let getWorklistBusinessApplyListAjax = null;
exports.getWorklistBusinessApplyList = function() {
    var Deferred = $.Deferred();
    getWorklistBusinessApplyListAjax && getWorklistBusinessApplyListAjax.abort();
    getWorklistBusinessApplyListAjax = $.ajax({
        url: '/rest/get/worklist/business_apply/list',
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//添加出差申请
let addBusinessApplyAjax = null;
exports.addBusinessApply = function(data) {
    var Deferred = $.Deferred();
    addBusinessApplyAjax && addBusinessApplyAjax.abort();
    addBusinessApplyAjax = $.ajax({
        url: '/rest/add/apply/list',
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
//获取回复列表
let getBusinessApplyCommentListAjax = null;
exports.getBusinessApplyCommentList = function(queryObj) {
    var Deferred = $.Deferred();
    getBusinessApplyCommentListAjax && getBusinessApplyCommentListAjax.abort();
    getBusinessApplyCommentListAjax = $.ajax({
        url: '/rest/get/apply/comment/list',
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
let addBusinessApplyCommentsAjax = null;
exports.addBusinessApplyComments = function(data) {
    var Deferred = $.Deferred();
    addBusinessApplyCommentsAjax && addBusinessApplyCommentsAjax.abort();
    addBusinessApplyCommentsAjax = $.ajax({
        url: '/rest/add/apply/comment',
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
let approveApplyPassOrRejectAjax = null;
exports.approveApplyPassOrReject = function(obj) {
    var Deferred = $.Deferred();
    approveApplyPassOrRejectAjax && approveApplyPassOrRejectAjax.abort();
    approveApplyPassOrRejectAjax = $.ajax({
        url: '/rest/business_trip/submitApply',
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


