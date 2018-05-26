/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var restApis = {
    //获取客户跟踪记录
    getCustomerTraceList: "/rest/callrecord/v2/callrecord/query/trace/customer",
    // 添加客户跟踪记录
    addCustomerTraceList: "/rest/callrecord/v2/callrecord/trace",
    // 更新客户跟踪记录
    updateCustomerTraceList: "/rest/callrecord/v2/callrecord/trace",
};
exports.restUrls = restApis;
// 获取客户跟踪记录列表
exports.getCustomerTraceList = function(req, res) {
    let data = req.body;
    let url = restApis.getCustomerTraceList;
    if (data.id && data.page_size) {
        url += `?id=${data.id}&page_size=${data.page_size}`;
    } else if (data.id) {
        url += `?id=${data.id}`;
    } else if (data.page_size) {
        url += `?page_size=${data.page_size}`;
    }
    delete data.id;
    delete data.page_size;
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        },
        data);
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