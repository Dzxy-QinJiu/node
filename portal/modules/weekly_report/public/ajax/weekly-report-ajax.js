/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/6.
 */
// 获取成员信息
var getSaleMemberListAjax = null;
exports.getSaleMemberList = function(reqData) {
    var Deferred = $.Deferred();
    getSaleMemberListAjax && getSaleMemberListAjax.abort();
    getSaleMemberListAjax = $.ajax({
        url: '/rest/get/sale/member/' + reqData.type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
// 获取电话的接通情况
var getCallInfoAjax = null;
exports.getCallInfo = function(reqData) {
    var Deferred = $.Deferred();
    getCallInfoAjax && getCallInfoAjax.abort();
    getCallInfoAjax = $.ajax({
        url: '/rest/weekly_report/call/info',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
// 获取合同信息
var getContractInfoAjax = null;
exports.getContractInfo = function(reqData, type) {
    var Deferred = $.Deferred();
    getContractInfoAjax && getContractInfoAjax.abort();
    getContractInfoAjax = $.ajax({
        url: '/rest/weekly_report/contract/info/' + type,
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
// 获取回款信息
var getRepaymentInfoAjax = null;
exports.getRepaymentInfo = function(reqData, type) {
    var Deferred = $.Deferred();
    getRepaymentInfoAjax && getRepaymentInfoAjax.abort();
    getRepaymentInfoAjax = $.ajax({
        url: '/rest/weekly_report/repayment/info/' + type,
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 获取地域覆盖信息
var getRegionOverlayInfoAjax = null;
exports.getRegionOverlayInfo = function(reqData, type) {
    var Deferred = $.Deferred();
    getRegionOverlayInfoAjax && getRegionOverlayInfoAjax.abort();
    getRegionOverlayInfoAjax = $.ajax({
        url: '/rest/weekly_report/region/overlay/info/' + type,
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
// 获取客户阶段信息
var getCustomerStageInfoAjax = null;
exports.getCustomerStageInfo = function(reqData, type) {
    var Deferred = $.Deferred();
    getCustomerStageInfoAjax && getCustomerStageInfoAjax.abort();
    getCustomerStageInfoAjax = $.ajax({
        url: '/rest/weekly_report/customer/stage/info/' + type,
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
