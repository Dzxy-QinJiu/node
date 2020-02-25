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
    // 修改申请成员信息（姓名、邮箱）唯一性验证
    checkOnlyInviteMember: '/rest/base/v1/user/member/:key/:value/unique'
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
//姓名唯一性验证
exports.checkOnlyName = (req, res) => {
    let name = req.params.name;
    return restUtil.authRest.get(
        {
            url: restApis.checkOnlyInviteMember.replace(':key', 'nickname').replace(':value', name),
            req: req,
            res: res
        }, null);
};

//邮箱唯一性验证
exports.checkOnlyEmail = (req, res) => {
    let email = req.params.email;
    return restUtil.authRest.get(
        {
            url: restApis.checkOnlyInviteMember.replace(':key', 'email').replace(':value', email),
            req: req,
            res: res
        }, req.query);
};