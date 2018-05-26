"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var Promise = require("bluebird");
var EventEmitter = require("events").EventEmitter;
const restApis = {
    // 获取团队信息
    getSaleGroupTeams: '/rest/base/v1/group/teams/:type',
    // 获取成员信息
    getSaleMemberList: '/rest/base/v1/group/team/members/:type',
    // 获取电话的接通情况
    getCallInfo: "/rest/callrecord/v2/callrecord/query/:type/call_record/view",
    //添加, 更新，删除员工请假信息
    AskForLeave: "/rest/callrecord/v2/askforleave",
    //合同报表统计
    getContractInfo: "/rest/analysis/contract/report/contract/:type",
    //合同回款统计
    getRepaymentInfo: "/rest/analysis/contract/report/repayment/:type",
    //区域覆盖情况统计
    getRegionOverlay: "/rest/analysis/customer/v2/statistic/:type/region/overlay",
    //获取所有的销售阶段
    getSalesStageList: "/rest/customer/v2/salestage",
    //销售阶段统计数据
    getCustomerStage: "/rest/analysis/customer/v2/statistic/:type/weekly/customer/stage",

};

// 获取团队信息
exports.getSaleGroupTeams = function(req, res, params) {
    return restUtil.authRest.get(
        {
            url: restApis.getSaleGroupTeams.replace(":type", params.type),
            req: req,
            res: res
        });
};

// 获取成员信息
exports.getSaleMemberList = function(req, res, params) {
    return restUtil.authRest.get(
        {
            url: restApis.getSaleMemberList.replace(":type", params.type),
            req: req,
            res: res
        });
};
// 获取电话的接通情况
exports.getCallInfo = function(req, res, params, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getCallInfo.replace(":type", params.type),
            req: req,
            res: res
        }, reqData);
};
//添加员工请假信息
exports.addAskForLeave = function(req, res, reqObj) {
    return restUtil.authRest.post(
        {
            url: restApis.AskForLeave,
            req: req,
            res: res
        }, reqObj);
};
//更新员工请假信息
exports.updateAskForLeave = function(req, res, reqObj) {
    return restUtil.authRest.put(
        {
            url: restApis.AskForLeave,
            req: req,
            res: res
        }, reqObj);
};
//删除某条员工请假信息
exports.deleteAskForLeave = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.AskForLeave + "?ids=" + req.params.id,
            req: req,
            res: res
        });
};
//获取合同情况
exports.getContractInfo = function(req, res, params, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getContractInfo.replace(":type", params.type),
            req: req,
            res: res
        }, reqData);
};
//获取回款情况
exports.getRepaymentInfo = function(req, res, params, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getRepaymentInfo.replace(":type", params.type),
            req: req,
            res: res
        }, reqData);
};
//获取区域覆盖情况
exports.getRegionOverlayInfo = function(req, res, params, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getRegionOverlay.replace(":type", params.type),
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
                    reject(errorObj.message);
                }
            });
    });
}
//获取客户阶段情况
function getCustomerStageInfo(req, res, params, reqData) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: restApis.getCustomerStage.replace(":type", params.type),
                req: req,
                res: res
            }, reqData, {
                success: function(eventEmitter, data) {
                    resolve(data);
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj.message);
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
        emitter.emit("success", dataObj);
    }, function(errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};