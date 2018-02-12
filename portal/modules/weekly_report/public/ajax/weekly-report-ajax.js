/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/6.
 */
// 获取团队信息
var getSaleGroupTeamsAjax = null;
exports.getSaleGroupTeams = function (reqData) {
    var Deferred = $.Deferred();
    getSaleGroupTeamsAjax && getSaleGroupTeamsAjax.abort();
    getSaleGroupTeamsAjax = $.ajax({
        url: '/rest/get/sale/teams/' + reqData.type,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取成员信息
var getSaleMemberListAjax = null;
exports.getSaleMemberList = function (reqData) {
    var Deferred = $.Deferred();
    getSaleMemberListAjax && getSaleMemberListAjax.abort();
    getSaleMemberListAjax = $.ajax({
        url: '/rest/get/sale/member/' + reqData.type,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
// 获取电话的接通情况
var getCallInfoAjax = null;
exports.getCallInfo = function (pathParam, reqData, type) {
    var Deferred = $.Deferred();
    getCallInfoAjax && getCallInfoAjax.abort();
    getCallInfoAjax = $.ajax({
        url: '/rest/weekly_report/call/info/' + type,
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//添加员工请假信息
var addAskForLeaveAjax = null;
exports.addAskForLeave = function (reqData) {
    var Deferred = $.Deferred();
    addAskForLeaveAjax && addAskForLeaveAjax.abort();
    addAskForLeaveAjax = $.ajax({
        url: '/rest/weekly_report/add/askForLeave',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//更新员工请假信息
var updateAskForLeaveAjax = null;
exports.updateAskForLeave = function (reqData) {
    var Deferred = $.Deferred();
    updateAskForLeaveAjax && updateAskForLeaveAjax.abort();
    updateAskForLeaveAjax = $.ajax({
        url: '/rest/weekly_report/update/askForLeave',
        dataType: 'json',
        type: 'put',
        data: reqData,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//删除员工请假信息
var deleteAskForLeaveAjax = null;
exports.deleteAskForLeave = function (id) {
    var Deferred = $.Deferred();
    deleteAskForLeaveAjax && deleteAskForLeaveAjax.abort();
    deleteAskForLeaveAjax = $.ajax({
        url: '/rest/weekly_report/delete/askForLeave/' + id,
        dataType: 'json',
        type: 'delete',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};