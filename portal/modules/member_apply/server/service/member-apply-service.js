/**
 * Created by hzl on 2019/3/5.
 */

var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');

var restApis = {
    //查询所有的成员申请
    allWorkFlowApplyList: '/rest/base/v1/workflow/applylist',
    //查询由当前账号审批的成员申请
    applylistWorkFlowWorkList: '/rest/base/v1/workflow/worklist',
    //通过或者驳回申请
    approveMemberApplyPassOrReject: '/rest/base/v1/workflow/memberinvite/approve',
    //获取申请的状态
    getApplyStatusById: '/rest/base/v1/workflow/status',
    //根据成员申请的id查询申请的详情
    getApplyDetailById: '/rest/base/v1/workflow/detail',
    //获取批注和添加批注
    getOrAddApplyComments: '/rest/base/v1/workflow/comments',
};
exports.restUrls = restApis;
//获取所有的成员申请
exports.getAllMemberApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.allWorkFlowApplyList,
            req: req,
            res: res
        }, req.query);
};
//查询由当前账号审批的成员申请
exports.getWorklistMemberApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.applylistWorkFlowWorkList,
            req: req,
            res: res
        }, req.query);
};

//根据审批的id获取审批的详情
exports.getMemberApplyDetailById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getApplyDetailById,
            req: req,
            res: res
        }, req.query);
};
//获取审批意见
exports.getMemberApplyComments = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getOrAddApplyComments,
            req: req,
            res: res
        }, req.query);
};
//添加审批意见
exports.addMemberApplyComments = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getOrAddApplyComments,
            req: req,
            res: res
        }, req.body);
};
//批准或驳回审批
exports.approveMemberApplyPassOrReject = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveMemberApplyPassOrReject,
            req: req,
            res: res
        }, req.body);
};
//获取成员申请的状态
exports.getMemberApplyStatusById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getApplyStatusById,
            req: req,
            res: res
        }, req.query);
};
