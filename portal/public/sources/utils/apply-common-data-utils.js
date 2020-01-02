/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/20.
 */
//获取全部申请列表
let getAllApplyListAjax = null;
exports.getAllApplyList = function(queryObj) {
    var Deferred = $.Deferred();
    getAllApplyListAjax && getAllApplyListAjax.abort();
    getAllApplyListAjax = $.ajax({
        url: '/rest/get/all/apply_approve/list',
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
let getWorklistApplyListAjax = null;
exports.getWorklistApplyList = function(queryObj) {
    var Deferred = $.Deferred();
    getWorklistApplyListAjax && getWorklistApplyListAjax.abort();
    getWorklistApplyListAjax = $.ajax({
        url: '/rest/get/worklist/apply_approve/list',
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
let getApplyDetailByIdAjax = null;
exports.getApplyDetailById = function(queryObj) {
    var Deferred = $.Deferred();
    getApplyDetailByIdAjax && getApplyDetailByIdAjax.abort();
    getApplyDetailByIdAjax = $.ajax({
        url: '/rest/apply_approve/detail/by/id',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON || Intl.get('user.get.apply.detail.failed', '获取申请审批详情失败'));
        }
    });
    return Deferred.promise();
};
//获取回复列表
let getApplyCommentListAjax = null;
exports.getApplyCommentList = function(queryObj) {
    var Deferred = $.Deferred();
    getApplyCommentListAjax && getApplyCommentListAjax.abort();
    getApplyCommentListAjax = $.ajax({
        url: '/rest/get/apply_approve/comment/list',
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
let addApplyCommentsAjax = null;
exports.addApplyComments = function(data) {
    var Deferred = $.Deferred();
    addApplyCommentsAjax && addApplyCommentsAjax.abort();
    addApplyCommentsAjax = $.ajax({
        url: '/rest/add/apply_approve/comment',
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
//获取某个申请的状态
let getApplyStatusByIdAjax = null;
exports.getApplyStatusById = function(queryObj) {
    var Deferred = $.Deferred();
    getApplyStatusByIdAjax && getApplyStatusByIdAjax.abort();
    getApplyStatusByIdAjax = $.ajax({
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
//通过或者驳回申请
let approveApplyPassOrRejectReportOrDocumentAjax = null;
exports.approveApplyPassOrRejectReportOrDocument = function(obj) {
    var Deferred = $.Deferred();
    approveApplyPassOrRejectReportOrDocumentAjax && approveApplyPassOrRejectReportOrDocumentAjax.abort();
    approveApplyPassOrRejectReportOrDocumentAjax = $.ajax({
        url: '/rest/opinionreport/submitApply',
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
let deleteLoadApplyApproveFileAjax = null;
exports.deleteLoadApplyApproveFile = function(queryObj) {
    var Deferred = $.Deferred();
    deleteLoadApplyApproveFileAjax && deleteLoadApplyApproveFileAjax.abort();
    deleteLoadApplyApproveFileAjax = $.ajax({
        url: '/rest/applyapprove/delete',
        dataType: 'json',
        type: 'delete',
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
