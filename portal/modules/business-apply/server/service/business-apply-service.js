/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var restApis = {
    //查询所有的出差申请
    allBussinessTrip: '/rest/base/v1/workflow/applylist',
    //查询当前账号发起的出差申请
    selfBussinessTrip: '/rest/base/v1/workflow/businesstrip/applylist/self',
    //查询由当前账号审批的出差申请
    applylistBussinessTrip: '/rest/base/v1/workflow/businesstrip/worklist',
    //添加出差申请
    addBusinessApply: '/rest/base/v1/workflow/businesstrip',
    //获取申请列表
    getOrAddApplyComments: '/rest/base/v1/workflow/comments',
    //通过或者驳回申请
    approveApplyPassOrReject: '/rest/base/v1/workflow/businesstrip/approve',
    //获取申请的状态
    getApplyStatusById: '/rest/base/v1/workflow/status',
    //撤销申请审批
    cancelApplyApprove: '/rest/base/v1/workflow/cancel',
    //修改出差申请的拜访时间
    updateVisitCustomerTime: '/rest/base/v1/workflow/businesstrip/:id'

};
exports.restUrls = restApis;
var _ = require('lodash');
//获取所有的出差申请
exports.getAllBusinessApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.allBussinessTrip,
            req: req,
            res: res
        }, req.query);
};
//获取当前账号发起的出差申请
exports.getSelfBusinessApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.selfBussinessTrip,
            req: req,
            res: res
        }, null);
};
//查询由当前账号审批的出差申请
exports.getWorklistBusinessApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.applylistBussinessTrip,
            req: req,
            res: res
        }, null);
};
//添加出差申请
exports.addBusinessApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addBusinessApply,
            req: req,
            res: res
        }, req.body);
};
//根据审批的id获取审批的详情
exports.getApplyDetailById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getApplyDetailById,
            req: req,
            res: res
        }, req.query);
};
//获取审批意见
exports.getApplyComments = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getOrAddApplyComments,
            req: req,
            res: res
        }, req.query);
};
//添加审批意见
exports.addApplyComments = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getOrAddApplyComments,
            req: req,
            res: res
        }, req.body);
};
//批准或驳回审批
exports.approveApplyPassOrReject = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveApplyPassOrReject,
            req: req,
            res: res
        }, req.body);
};
//获取出差申请的状态
exports.getApplyStatusById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getApplyStatusById,
            req: req,
            res: res
        }, req.query);
};
// 撤销申请
exports.cancelApplyApprove = function(req, res) {
    return restUtil.authRest.post({
        url: restApis.cancelApplyApprove,
        req: req,
        res: res
    }, req.body);
};
//修改拜访客户的实际
exports.updateVisitCustomerTime = function(req, res) {
    let bodyData = req.body;
    let applyId = bodyData.applyId;
    delete bodyData.applyId;
    return restUtil.authRest.put({
        url: restApis.updateVisitCustomerTime.replace(':id', applyId),
        req: req,
        res: res
    }, bodyData);
};
