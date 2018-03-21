/**
 * Created by zhangshujuan on 2018/2/27.
 */
"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var _ = require("underscore");
var salesObj = require("../dto/salesObj");
var EventEmitter = require("events").EventEmitter;
var restApis = {
    //获取销售-电话列表
    getSalesPhone: "/rest/callrecord/v2/callrecord/query/:type/call_record/view",
    //获取即将过期用户列表
    getExpireUser: "/rest/base/v1/view/expireuser",
    queryContactCustomer: "/rest/customer/v2/customer/range",//查询客户
    //获取近期登录的客户
    getRecentLoginCustomer: "/rest/analysis/user/customer/:type/recent_login",
    //获取近期登录的客户数量
    getRecentLoginCustomerCount: "/rest/analysis/user/customer/:type/recent_login_count",
    //即将到期的客户
    getWillExpiredCustomers: "/rest/analysis/customer/v2/statistic/:type/expire/customer",
    //获取新分配的客户
    getNewDistributeCustomers: "/rest/customer/v2/customer/query/allot/nocontacted",
};
exports.restUrls = restApis;
//获取销售-电话列表
exports.getSalesPhone = function (req, res, reqData, type) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesPhone.replace(":type", type),
            req: req,
            res: res
        }, reqData, {
            success: function (eventEmitter, data) {
                //处理数据
                var salesPhone = salesObj.toFrontSalesPhone(data);
                eventEmitter.emit("success", salesPhone);
            }
        });
};
//获取过期用户列表
exports.getExpireUser = function (req, res) {
    var queryObj = req.query;
    var url = restApis.getExpireUser;
    if (!_.isEmpty(queryObj)) {
        if (queryObj.team_id) {
            url += "?team_id=" + queryObj.team_id;
        }
        if (queryObj.member_id) {
            url += "?member_id=" + queryObj.member_id;
        }
    }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null);
};

// 获取今天联系的客户
exports.queryContactCustomer = function (req, res) {
    var url = restApis.queryContactCustomer;
    var queryObj = {};
    queryObj.rang_params = JSON.parse(req.body.rangParams);
    return restUtil.authRest.post({
        url: url + "/" + req.params.pageSize + "/" + req.params.sortFeild + "/" + req.params.sortOrder,
        req: req,
        res: res
    }, queryObj);
};

//获取近期登录的客户
exports.getRecentLoginCustomer = function (req, res) {
    var url = restApis.getRecentLoginCustomer;
    return restUtil.authRest.post({
        url: url.replace(":type", req.params.type),
        req: req,
        res: res
    }, req.body)
};
//获取最近登录的客户数量
exports.getRecentLoginCustomerCount = function (req, res) {
    var url = restApis.getRecentLoginCustomerCount;
    return restUtil.authRest.post({
        url: url.replace(":type", req.params.type),
        req: req,
        res: res
    }, req.body)
};
//获取即将到期的客户
exports.getWillExpireCustomer = function (req, res) {
    var url = restApis.getWillExpiredCustomers;
    return restUtil.authRest.get({
        url: url.replace(":type", req.params.type),
        req: req,
        res: res
    }, req.body)
};
//获取新分配的客户
exports.getNewDistributeCustomers = function (req, res) {
    var url = restApis.getNewDistributeCustomers;
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        },  req.body);
};
