/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
//获取全部申请列表
let getAllLeaveApplyListAjax = null;
exports.getAllLeaveApplyList = function(queryObj) {
    var Deferred = $.Deferred();
    getAllLeaveApplyListAjax && getAllLeaveApplyListAjax.abort();
    getAllLeaveApplyListAjax = $.ajax({
        url: '/rest/get/all/leave_apply/list',
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
let getWorklistLeaveApplyListAjax = null;
exports.getWorklistLeaveApplyList = function(queryObj) {
    var Deferred = $.Deferred();
    getWorklistLeaveApplyListAjax && getWorklistLeaveApplyListAjax.abort();
    getWorklistLeaveApplyListAjax = $.ajax({
        url: '/rest/get/worklist/leave_apply/list',
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
let getLeaveApplyDetailByIdAjax = null;
exports.getLeaveApplyDetailById = function(queryObj) {
    var Deferred = $.Deferred();
    getLeaveApplyDetailByIdAjax && getLeaveApplyDetailByIdAjax.abort();
    getLeaveApplyDetailByIdAjax = $.ajax({
        url: '/rest/leave_apply/detail/byId',
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
let getLeaveApplyCommentListAjax = null;
exports.getLeaveApplyCommentList = function(queryObj) {
    var Deferred = $.Deferred();
    getLeaveApplyCommentListAjax && getLeaveApplyCommentListAjax.abort();
    getLeaveApplyCommentListAjax = $.ajax({
        url: '/rest/get/leave_apply/comment/list',
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
let addLeaveApplyCommentsAjax = null;
exports.addLeaveApplyComments = function(data) {
    var Deferred = $.Deferred();
    addLeaveApplyCommentsAjax && addLeaveApplyCommentsAjax.abort();
    addLeaveApplyCommentsAjax = $.ajax({
        url: '/rest/add/leave_apply/comment',
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
//获取某个申请的状态
let getLeaveApplyStatusByIdAjax = null;
exports.getLeaveApplyStatusById = function(queryObj) {
    var Deferred = $.Deferred();
    getLeaveApplyStatusByIdAjax && getLeaveApplyStatusByIdAjax.abort();
    getLeaveApplyStatusByIdAjax = $.ajax({
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