/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
let getAllApplyListAjax = null;
exports.getAllApplyList = function(queryObj) {
    var Deferred = $.Deferred();
    getAllApplyListAjax && getAllApplyListAjax.abort();
    getAllApplyListAjax = $.ajax({
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
let getSelfApplyListAjax = null;
exports.getSelfApplyList = function() {
    var Deferred = $.Deferred();
    getSelfApplyListAjax && getSelfApplyListAjax.abort();
    getSelfApplyListAjax = $.ajax({
        url: '/rest/get/self/leave_apply/list',
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
let getWorklistLeaveApplyListAjax = null;
exports.getWorklistLeaveApplyList = function() {
    var Deferred = $.Deferred();
    getWorklistLeaveApplyListAjax && getWorklistLeaveApplyListAjax.abort();
    getWorklistLeaveApplyListAjax = $.ajax({
        url: '/rest/get/worklist/leave_apply/list',
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
let addLeaveApplyAjax = null;
exports.addLeaveApply = function(data) {
    var Deferred = $.Deferred();
    addLeaveApplyAjax && addLeaveApplyAjax.abort();
    addLeaveApplyAjax = $.ajax({
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
//根据申请的id获取申请的详情
let getLeaveApplyDetailByIdAjax = null;
exports.getLeaveApplyDetailById = function(queryObj) {
    var Deferred = $.Deferred();
    getLeaveApplyDetailByIdAjax && getLeaveApplyDetailByIdAjax.abort();
    getLeaveApplyDetailByIdAjax = $.ajax({
        url: '/rest/apply/detail/byId',
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