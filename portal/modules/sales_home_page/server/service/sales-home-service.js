/**
 * Created by wangliping on 2016/9/6.
 */
"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var salesObj = require("../dto/salesObj");
var EventEmitter = require("events").EventEmitter;
var Promise = require('bluebird');
var _ = require("underscore");
var restApis = {
    //获取销售团队
    getSalesTeamTree: "/rest/base/v1/group/teams/tree/:type",
    //获取销售-客户列表
    getSalesCustomer: "/rest/base/v1/view/customer",
    //获取销售-电话列表
    getSalesPhone: "/rest/callrecord/v2/callrecord/query/:type/call_record/view",
    //获取销售-用户列表
    getSalesUser: "/rest/base/v1/view/user",
    //获取销售-合同列表
    getSalesContract: "/rest/base/v1/view/contract",
    // 获取应用列表
    getGrantApplications: "/rest/base/v1/application/grant_applications",
    //获取即将过期用户列表
    getExpireUser: "/rest/base/v1/view/expireuser",
    //获取网站个性化配置 或对网站进行个性化设置
    websiteConfig:"/rest/base/v1/user/website/config",
};
exports.restUrls = restApis;

//获取应用的id列表
function getGrantApplications(req, res, status) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get({
            url: restApis.getGrantApplications,
            req: req,
            res: res
        }, {
            status: status
        }, {
            success: function (eventEmitter, list) {
                if (!_.isArray(list)) {
                    list = [];
                }
                var responseList = list.map(function (originApp) {
                    return originApp.client_id;
                });
                resolve(responseList);
            }
        });
    });

};
//获取当前销售所在销售团队的团队树
exports.getSalesTeamTree = function (req, res, type) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesTeamTree.replace(":type", type),
            req: req,
            res: res
        }, null);
};

//获取销售-客户列表
exports.getSalesCustomer = function (req, res, timeRange) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesCustomer,
            req: req,
            res: res
        }, timeRange, {
            success: function (eventEmitter, data) {
                //处理数据
                var salesCustomer = salesObj.toFrontSalesCustomer(data);
                eventEmitter.emit("success", salesCustomer);
            }
        });
};

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

//获取销售-用户列表
exports.getSalesUser = function (req, res, timeRange) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesUser,
            req: req,
            res: res
        }, timeRange, {
            success: function (eventEmitter, data) {
                //处理数据
                var salesUser = salesObj.toFrontSalesUser(data);
                eventEmitter.emit("success", salesUser);
            }
        });
};

//获取销售-合同列表
exports.getSalesContract = function (req, res, timeRange) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesContract,
            req: req,
            res: res
        }, timeRange);
};

//获取过期用户列表
exports.getExpireUser = function (req, res) {
    var queryObj = req.query;
    var url = restApis.getExpireUser ;
    if (!_.isEmpty(queryObj)){
        if (queryObj.team_id){
            url += "?team_id=" + queryObj.team_id;
        }
        if (queryObj.member_id){
            url += "?member_id=" + queryObj.member_id;
        }
    }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null, {
            success: function (eventEmitter, data) {
                //处理数据
                var expireUser = salesObj.toFrontExpireUser(data);
                eventEmitter.emit("success", expireUser);
            }
        });
};
//获取网站个性化设置
exports.getWebsiteConfig = function (req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.websiteConfig,
            req: req,
            res: res
        }, null,{
            success:function (eventEmitter, data) {
              //空值的处理
                if (!data){
                    data = {};
                }
                eventEmitter.emit("success", data);
            },
        });
};
//对网站进行个性化设置
exports.setWebsiteConfig = function (req, res ,reqObj) {
    return restUtil.authRest.post(
        {
            url: restApis.websiteConfig,
            req: req,
            res: res
        }, reqObj);
};