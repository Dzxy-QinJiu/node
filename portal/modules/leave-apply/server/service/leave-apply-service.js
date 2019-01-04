/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var restApis = {
    //添加请假申请
    addLeaveApply: 'http://172.19.103.211:8391/rest/base/v1/workflow/leave',
    //查询所有的请假申请
    allWorkFlowApplyList: '/rest/base/v1/workflow/applylist',
    //查询由当前账号审批的请假申请
    applylistWorkFlowWorkList: '/rest/base/v1/workflow/worklist',
    //通过或者驳回申请
    approveLeaveApplyPassOrReject: '/rest/base/v1/workflow/leave/approve',
    //获取申请的状态
    getApplyStatusById: '/rest/base/v1/workflow/status',
    //根据请假申请的id查询申请的详情
    getApplyDetailById: '/rest/base/v1/workflow/detail',
    //获取批注和添加批注
    getOrAddApplyComments: '/rest/base/v1/workflow/comments',
};
exports.restUrls = restApis;
//获取所有的请假申请
exports.getAllLeaveApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.allWorkFlowApplyList,
            req: req,
            res: res
        }, req.query);
};
//查询由当前账号审批的请假申请
exports.getWorklistLeaveApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.applylistWorkFlowWorkList,
            req: req,
            res: res
        }, req.query);
};
//添加请假申请
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
            url: restApis.getApplyDetailById,
            req: req,
            res: res
        }, req.query);
};
//获取审批意见
exports.getLeaveApplyComments = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getOrAddApplyComments,
            req: req,
            res: res
        }, req.query);
};
//添加审批意见
exports.addLeaveApplyComments = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getOrAddApplyComments,
            req: req,
            res: res
        }, req.body);
};
//批准或驳回审批
exports.approveLeaveApplyPassOrReject = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveLeaveApplyPassOrReject,
            req: req,
            res: res
        }, req.body);
};
//获取请假申请的状态
exports.getLeaveApplyStatusById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getApplyStatusById,
            req: req,
            res: res
        }, req.query);
};