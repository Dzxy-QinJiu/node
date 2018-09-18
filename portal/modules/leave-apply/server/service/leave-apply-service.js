/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var restApis = {
    //查询所有的出差申请
    allBussinessTrip: '/rest/base/v1/workflow/businesstrip/applylist',
    //查询当前账号发起的出差申请
    selfBussinessTrip: '/rest/base/v1/workflow/businesstrip/applylist/self',
    //查询由当前账号审批的出差申请
    applylistBussinessTrip: '/rest/base/v1/workflow/businesstrip/worklist',
    //添加出差申请
    addLeaveApply: '/rest/base/v1/workflow/businesstrip',
    //根据出差申请的id查询申请的详情
    getLeaveApplyDetailById: '/rest/base/v1/workflow/businesstrip/detail'
};
exports.restUrls = restApis;
var _ = require('lodash');
//获取所有的出差申请
exports.getAllLeaveApplyList = function(req, res) {
    var queryObj = req.query;
    var url = restApis.allBussinessTrip;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryObj);
};
//获取当前账号发起的出差申请
exports.getSelfLeaveApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.selfBussinessTrip,
            req: req,
            res: res
        }, null);
};
//查询由当前账号审批的出差申请
exports.getWorklistLeaveApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.applylistBussinessTrip,
            req: req,
            res: res
        }, null);
};
//添加出差申请
exports.addLeaveApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addLeaveApply,
            req: req,
            res: res
        }, req.body);
};
//根据审批的id获取审批的详情
exports.getLeaveApplyDetailById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getLeaveApplyDetailById,
            req: req,
            res: res
        }, req.query);
};