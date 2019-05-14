'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var CallObj = require('../dto/call-analysis');
var _ = require('lodash');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
const restApis = {
    // 获取单次通话时长为top10的数据(团队)
    getCallDurTopTen: '/rest/callrecord/v2/callrecord/query/trace/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order',
    // 获取单次通话时长为top10的数据（所有的，包括不在团队里的数据）
    getManagerCallDurTopTen: '/rest/callrecord/v2/callrecord/query/manager/trace/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order',
    // 获取销售个人的top10
    getSingleUserCallDurTopTen: '/rest/callrecord/v2/callrecord/query/trace/user/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order',
    // 获取通话数量和通话时长趋势图统计(团队)
    getCallCountAndDur: '/rest/callrecord/v2/callrecord/histogram/:start_time/:end_time/:interval',
    //分别返回团队的通话数量和通话时长
    getTeamCallCountAndDur: '/rest/callrecord/v2/callrecord/histogram/team/:start_time/:end_time/:interval',
    //  获取通话数量和通话时长趋势图统计(销售个人)
    getSingleUserCallCountAndDur: '/rest/callrecord/v2/callrecord/histogram/user/:start_time/:end_time/:interval',
    // 获取电话的接通情况
    getCallInfo: '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/view',
    // 114占比(团队)
    getTeamCallRate: '/rest/callrecord/v2/callrecord/term/:start_time/:end_time',
    // 114占比（个人）
    getUserCallRate: '/rest/callrecord/v2/callrecord/term/user/:start_time/:end_time',
    // 获取成员信息
    getSaleMemberList: '/rest/base/v1/group/team/members/:type',
    //获取通话时间段(数量\时长)的统计数据, authType = manager管理员（可以查看所有团队的数据），user:销售（只能看我的及我的下级团队的数据）
    getCallIntervalData: '/rest/callrecord/v2/callrecord/query/:authType/call_record/statistic',
    //获取通话总次数、总时长Top10
    getCallTotalList: '/rest/callrecord/v2/callrecord/query/:authType/call_record/top',
    //获取销售团队中启用状态成员的数量
    getActiveSalesInTeams: '/rest/base/v1/group/team/available/statistic',
    // 获取通话客户的地域和阶段分布
    getCallCustomerZoneStage: '/rest/callrecord/v2/callrecord/query/:authType/call_record/region/stage/statistic'
};
 
// 获取单次通话时长为top10的数据
exports.getCallDurTopTen = function(req, res, params, reqBody) {
    let url = params.type === 'manager' ? restApis.getManagerCallDurTopTen : restApis.getCallDurTopTen;
    if (reqBody && reqBody.user_id) {
        url = restApis.getSingleUserCallDurTopTen;
    }
    return restUtil.authRest.post(
        {
            url: url.replace(':start_time', params.start_time)
                .replace(':end_time', params.end_time)
                .replace(':page_size', params.page_size)
                .replace(':sort_field', params.sort_field)
                .replace(':sort_order', params.sort_order),
            req: req,
            res: res
        }, reqBody);
};

// 获取通话数量和通话时长趋势图统计
exports.getCallCountAndDur = function(req, res, params, reqBody) {
    // 团队
    let url = restApis.getCallCountAndDur;
    if (reqBody && reqBody.user_id) { // 销售个人
        url = restApis.getSingleUserCallCountAndDur;
    }
    return restUtil.authRest.post(
        {
            url: url.replace(':start_time', params.start_time).replace(':end_time', params.end_time).replace(':interval', 'day'),
            req: req,
            res: res
        }, reqBody);
};
exports.getCallCountAndDurSeperately = function(req, res, params, reqBody) {
    return restUtil.authRest.post(
        {
            url: restApis.getTeamCallCountAndDur.replace(':start_time', params.start_time).replace(':end_time', params.end_time).replace(':interval', 'day'),
            req: req,
            res: res
        }, reqBody, {
            success: function(emitter, teamCallData) {
                var list = [];
                _.each(teamCallData.result, (value, key) => {
                    list.push({
                        teamId: key,
                        teamData: value
                    });
                });
                emitter.emit('success', list);
            }
        });
};

function batchGetCallInfo(req, res, reqData) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get({
            url: restApis.getCallInfo,
            req: req,
            res: res
        }, reqData, {
            success: function(eventEmitter, data) {
                //处理数据
                var callInfo = CallObj.toFrontCallAnalysis(data);
                resolve(callInfo);
            },
            error: function(eventEmitter, errorDesc) {
                reject(errorDesc);
            }
        });
    });
}
//获取销售团队中启用状态成员的数量
function getActiveSalesInTeams(req, res) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get({
            url: restApis.getActiveSalesInTeams,
            req: req,
            res: res
        }, null, {
            success: function(eventEmitter, data) {
                resolve(data);
            },
            error: function(eventEmitter, errorDesc) {
                reject(errorDesc);
            }
        });
    });
}

// 获取电话的接通情况
exports.getCallInfo = function(req, res, reqData) {
    var emitter = new EventEmitter();
    let memberArray = reqData.member_ids ? reqData.member_ids.split(',') : [];
    let memberArrayLength = memberArray.length;
    if (reqData.member_ids && memberArrayLength > 80) {
        let promiseList = [];
        let paramsObj = {
            device_type: reqData.device_type,
            start_time: reqData.start_time,
            end_time: reqData.end_time
        };
        let queryNumber = 60;
        let queryCount = Math.ceil(memberArrayLength / queryNumber);
        for (let i = 0; i < queryCount; i++) {
            paramsObj.member_ids = memberArray.slice(i * queryNumber, _.min([(i + 1) * queryNumber, memberArrayLength])).join(',');
            promiseList.push(batchGetCallInfo(req, res, paramsObj));
        }
        Promise.all(promiseList).then((result) => {
            let allData = [];
            _.map(result, (item) => {
                _.map(item.salesPhoneList, (item) => {
                    allData.push(item);
                });
            });
            emitter.emit('success', {salesPhoneList: allData});
        }).catch((err) => {
            emitter.emit('error', err);
        });
    } else {
        let promiseList = [batchGetCallInfo(req, res, reqData), getActiveSalesInTeams(req, res)];
        Promise.all(promiseList).then((dataList) => {
            var result = dataList[0] ? dataList[0] : [];
            //所有团队列表
            var teamList = dataList[1];
            _.each(result.salesPhoneList, (data) => {
                var team = _.find(teamList,teamItem => teamItem.team_name === data.name);
                if (team && team.available){
                    //某个团队中在职人员的个数
                    data.memberTotal = team.available.user;
                }
            });
            emitter.emit('success', result);
        }).catch((err) => {
            emitter.emit('error', err);
        });
    }
    return emitter;
};

// 114占比
exports.getCallRate = function(req, res, params, reqBody) {
    // 团队
    let url = restApis.getTeamCallRate;
    // 成员 
    if (reqBody && reqBody.user_id) {
        url = restApis.getUserCallRate;
    }
    const typeHandler = () => {
        if (req.body && req.body.filter_invalid_phone) {
            return '?filter_invalid_phone=' + req.body.filter_invalid_phone;
        }
        else if (req.body && req.body.filter_phone) {
            return '?filter_phone=' + req.body.filter_phone;
        }
        else {
            return '';
        }
    };
    return restUtil.authRest.post(
        {
            url: url.replace(':start_time', params.start_time)
                .replace(':end_time', params.end_time) + typeHandler(),
            req: req,
            res: res
        }, reqBody);
};

//获取通话数量和时长的统计数据
exports.getCallIntervalData = function(req, res, reqQuery) {
    return restUtil.authRest.get(
        {
            url: restApis.getCallIntervalData.replace(':authType', req.params.authType),
            req: req,
            res: res
        }, reqQuery);
};

// 获取通话总次数、总时长为top10的数据
exports.getCallTotalList = function(req, res, reqQuery) {
    return restUtil.authRest.get(
        {
            url: restApis.getCallTotalList.replace(':authType', req.params.authType),
            req: req,
            res: res
        }, reqQuery);
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

//获取客户阶段及地域统计Promise
function getStageZonePromise(req, res, field) {
    return new Promise((resolve, reject) => {
        req.query.field = field;

        return restUtil.authRest.get({
            url: restApis.getCallCustomerZoneStage.replace(':authType', req.params.authType),
            req: req,
            res: res
        }, req.query, {
            success: function(eventEmitter, data) {
                resolve(data);
            },
            error: function(eventEmitter, errorDesc) {
                reject(errorDesc);
            }
        });
    });
}

// 获取通话客户的地域和阶段分布
exports.getCallCustomerZoneStage = (req, res) => {
    const emitter = new EventEmitter();

    const promiseList = [
        //客户阶段统计
        getStageZonePromise(req, res, 'customer_label'),
        //订单阶段统计
        getStageZonePromise(req, res, 'sales_stage'),
        //地域统计
        getStageZonePromise(req, res, 'region')
    ];

    Promise.all(promiseList).then((result) => {
        let allData = {
            code: 0,
            customer_label_sum: result[0],
            opp_stage_sum: result[1],
            sum: result[2]
        };

        emitter.emit('success', allData);
    }).catch((err) => {
        emitter.emit('error', err);
    });

    return emitter;
};
