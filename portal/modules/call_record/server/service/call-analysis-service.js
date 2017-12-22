"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var CallObj = require('../dto/call-analysis');
var _ = require("underscore");
var Promise = require('bluebird');
var EventEmitter = require("events").EventEmitter;
const restApis = {
    // 获取单次通话时长为top10的数据(团队)
    getCallDurTopTen: '/rest/callrecord/v2/callrecord/query/trace/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order',
    // 获取销售个人的top10
    getSingleUserCallDurTopTen: '/rest/callrecord/v2/callrecord/query/trace/user/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order',
    // 获取通话数量和通话时长趋势图统计(团队)
    getCallCountAndDur: '/rest/callrecord/v2/callrecord/histogram/:start_time/:end_time/:interval',
    //  获取通话数量和通话时长趋势图统计(销售个人)
    getSingleUserCallCountAndDur: '/rest/callrecord/v2/callrecord/histogram/user/:start_time/:end_time/:interval',
    // 获取电话的接通情况
    getCallInfo: "/rest/base/v1/view/call_record/:type",
    // 114占比(团队)
    getTeamCallRate: "/rest/callrecord/v2/callrecord/term/:start_time/:end_time",
    // 114占比（个人）
    getUserCallRate: "/rest/callrecord/v2/callrecord/term/user/:start_time/:end_time",
    // 获取团队信息
    getSaleGroupTeams: '/rest/base/v1/group/teams/:type',
    // 获取成员信息
    getSaleMemberList: '/rest/base/v1/group/team/members/:type',
    //获取通话时间段(数量\时长)的统计数据, authType = manager管理员（可以查看所有团队的数据），user:销售（只能看我的及我的下级团队的数据）
    getCallIntervalData: '/rest/callrecord/v2/callrecord/query/:authType/call_record/statistic',
};

// 获取单次通话时长为top10的数据
exports.getCallDurTopTen = function (req, res, params, reqBody) {
    let url = restApis.getCallDurTopTen;
    if (reqBody && reqBody.user_id) {
        url = restApis.getSingleUserCallDurTopTen;
    }
    return restUtil.authRest.post(
        {
            url: url.replace(":start_time", params.start_time)
                .replace(":end_time", params.end_time)
                .replace(":page_size", params.page_size)
                .replace(":sort_field", params.sort_field)
                .replace(":sort_order", params.sort_order),
            req: req,
            res: res
        }, reqBody);
};

// 获取通话数量和通话时长趋势图统计
exports.getCallCountAndDur = function (req, res, params, reqBody) {
    // 团队
    let url = restApis.getCallCountAndDur;
    if (reqBody && reqBody.user_id) {  // 销售个人
        url = restApis.getSingleUserCallCountAndDur;
    }
    return restUtil.authRest.post(
        {
            url: url.replace(":start_time", params.start_time).replace(":end_time", params.end_time).replace(":interval", "day"),
            req: req,
            res: res
        }, reqBody);
};

function batchGetCallInfo(req, res, params, reqData) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get({
            url: restApis.getCallInfo.replace(":type", params.type),
            req: req,
            res: res
        }, reqData, {
            success: function (eventEmitter, data) {
                //处理数据
                var callInfo = CallObj.toFrontCallAnalysis(data);
                resolve(callInfo);
            },
            error: function (eventEmitter, errorDesc) {
                reject(errorDesc.message);
            }
        });
    });
}

// 获取电话的接通情况
exports.getCallInfo = function (req, res, params, reqData) {
    var emitter = new EventEmitter();
    let memberArray = reqData.member_ids ? reqData.member_ids.split(',') : [];
    let memberArrayLength = memberArray.length;
    if (reqData.member_ids && memberArrayLength > 80) {
        let promiseList = [];
        let paramsObj = {
            type: reqData.type,
            start_time: reqData.start_time,
            end_time: reqData.end_time
        };
        let queryNumber = 60;
        let queryCount = Math.ceil(memberArrayLength / queryNumber);
        for (let i = 0; i < queryCount; i++) {
            paramsObj.member_ids = memberArray.slice(i * queryNumber, _.min([(i + 1) * queryNumber, memberArrayLength])).join(',');
            promiseList.push(batchGetCallInfo(req, res, params, paramsObj));
        }
        Promise.all(promiseList).then((result) => {
            let allData = [];
            _.map(result, (item) => {
                _.map(item.salesPhoneList, (item) => {
                    allData.push(item)
                });
            });
            emitter.emit("success", {salesPhoneList: allData});
        }).catch((errorMsg) => {
            emitter.emit("error", errorMsg);
        });
    } else {
        batchGetCallInfo(req, res, params, reqData).then((result) => {
            emitter.emit("success", result);
        }).catch((errorMsg) => {
            emitter.emit("error", errorMsg);
        });
    }
    return emitter;
};

// 114占比
exports.getCallRate = function (req, res, params, reqBody) {
    // 团队
    let url = restApis.getTeamCallRate;
    // 成员 
    if (reqBody && reqBody.user_id) {
        url = restApis.getUserCallRate;
    }
    const typeHandler = () => {
        if (req.body && req.body.filter_invalid_phone) {
            return "?filter_invalid_phone=" + req.body.filter_invalid_phone
        }
        else {
            return ""
        }
    }
    return restUtil.authRest.post(
        {
            url: url.replace(":start_time", params.start_time)
                .replace(":end_time", params.end_time) + typeHandler(),
            req: req,
            res: res
        }, reqBody);
};

//获取通话数量和时长的统计数据
exports.getCallIntervalData = function (req, res, reqQuery) {
    return restUtil.authRest.get(
        {
            url: restApis.getCallIntervalData.replace(":authType", req.params.authType),
            req: req,
            res: res
        }, reqQuery);
};


// 获取团队信息
exports.getSaleGroupTeams = function (req, res, params) {
    return restUtil.authRest.get(
        {
            url: restApis.getSaleGroupTeams.replace(":type", params.type),
            req: req,
            res: res
        });
};

// 获取成员信息
exports.getSaleMemberList = function (req, res, params) {
    return restUtil.authRest.get(
        {
            url: restApis.getSaleMemberList.replace(":type", params.type),
            req: req,
            res: res
        });
};