'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
const restApis = {
    // 获取成员信息
    getSaleMemberList: '/rest/base/v1/group/team/members/:type',
    // 获取电话的接通情况
    getCallInfo: '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/view',
    //合同报表统计
    getContractInfo: '/rest/analysis/contract/report/contract/:type',
    //合同回款统计
    getRepaymentInfo: '/rest/analysis/contract/report/repayment/:type',
    //区域覆盖情况统计
    getRegionOverlay: '/rest/analysis/customer/v2/statistic/:type/region/overlay',
    //获取所有的销售阶段
    getSalesStageList: '/rest/customer/v2/salestage',
    //销售阶段统计数据
    getCustomerStage: '/rest/analysis/customer/v2/statistic/:type/weekly/customer/stage',

};

// 获取成员信息
exports.getSaleMemberList = function(req, res, params) {
    return restUtil.authRest.get(
        {
            url: restApis.getSaleMemberList.replace(':type', params.type),
            req: req,
            res: res
        });
};
// 获取电话的接通情况
exports.getCallInfo = function(req, res, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getCallInfo,
            req: req,
            res: res
        }, reqData);
};
//获取合同情况
exports.getContractInfo = function(req, res, params, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getContractInfo.replace(':type', params.type),
            req: req,
            res: res
        }, reqData);
};
//获取回款情况
exports.getRepaymentInfo = function(req, res, params, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getRepaymentInfo.replace(':type', params.type),
            req: req,
            res: res
        }, reqData);
};
//获取区域覆盖情况
exports.getRegionOverlayInfo = function(req, res, params, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getRegionOverlay.replace(':type', params.type),
            req: req,
            res: res
        }, reqData);
};
//获取销售阶段
function getSalesStage(req, res) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: restApis.getSalesStageList,
                req: req,
                res: res
            }, null, {
                success: function(eventEmitter, data) {
                    resolve(data);
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj && errorObj.message);
                }
            });
    });
}
//获取客户阶段情况
function getCustomerStageInfo(req, res, params, reqData) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: restApis.getCustomerStage.replace(':type', params.type),
                req: req,
                res: res
            }, reqData, {
                success: function(eventEmitter, data) {
                    resolve(data);
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj && errorObj.message);
                }
            });
    });
}

//获取客户阶段情况
exports.getCustomerStageInfo = function(req, res, params, reqData) {
    var emitter = new EventEmitter();
    let promiseList = [getCustomerStageInfo(req, res, params, reqData), getSalesStage(req, res)];
    Promise.all(promiseList).then((dataList) => {
        var dataObj = {};
        dataObj = dataList[0] || {};
        dataObj.stageList = dataList[1] ? dataList[1].result : [];
        emitter.emit('success', dataObj);
    }, function(errorMsg) {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};
