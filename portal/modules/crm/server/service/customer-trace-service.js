/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
var restApis = {
    //获取客户跟踪记录
    getCustomerTraceList: '/rest/callrecord/v2/callrecord/query/trace/customer',
    //获取跟进记录的分类统计
    getCustomerTraceStatistic: '/rest/analysis/callrecord/v1/callrecord/trace/type/count',
    // 添加客户跟踪记录
    addCustomerTraceList: '/rest/callrecord/v2/callrecord/trace',
    // 更新客户跟踪记录
    updateCustomerTraceList: '/rest/callrecord/v2/callrecord/trace',
    //微信小程序签到
    visitCustomer: '/rest/callrecord/v2/callrecord/visit',
    //获取某组织内跟进记录的类型（除去固定的电话、拜访、其他以外的类型）
    getExtraTraceType: '/rest/customer/v2/customer/trace_type'
};
exports.restUrls = restApis;
//获取某组织内跟进记录的类型（除去固定的电话、拜访、其他以外的类型）
exports.getExtraTraceType = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getExtraTraceType,
            req: req,
            res: res
        });
};
// 获取客户跟踪记录列表
exports.getCustomerTraceList = function(req, res) {
    let url = restApis.getCustomerTraceList;
    let isFirst = true;
    _.each(req.query, (value, key) => {
        if (isFirst) {
            url += `?${key}=${value}`;
            isFirst = false;
        } else {
            url += `&${key}=${value}`;
        }
    });
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, req.body);
};

//获取跟进记录的分类统计
exports.getCustomerTraceStatistic = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getCustomerTraceStatistic,
            req: req,
            res: res
        }, req.query);
};

// 添加客户跟踪记录
exports.addCustomerTraceList = function(req, res, obj) {
    var data = req.body;
    return restUtil.authRest.post(
        {
            url: restApis.addCustomerTraceList,
            req: req,
            res: res
        },
        data);
};
//更新客户跟踪记录
exports.updateCustomerTraceList = function(req, res, obj) {
    var data = req.body;
    return restUtil.authRest.put(
        {
            url: restApis.updateCustomerTraceList,
            req: req,
            res: res
        },
        data);
};
//获取播放录音
exports.getPhoneRecordAudio = function(req, res) {
    return restUtil.authRest.get(
        {
            url: req.url,
            req: req,
            res: res,
            'pipe-download-file': true
        }, null);
};
//签到
exports.visitCustomer = function(req,res) {
    var data = req.body;
    return restUtil.authRest.post(
        {
            url: restApis.visitCustomer,
            req: req,
            res: res
        },
        data);
};