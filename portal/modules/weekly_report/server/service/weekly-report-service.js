"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
const restApis = {
    // 获取团队信息
    getSaleGroupTeams: '/rest/base/v1/group/teams/:type',
    // 获取成员信息
    getSaleMemberList: '/rest/base/v1/group/team/members/:type',
    // 获取电话的接通情况
    getCallInfo: "/rest/callrecord/v2/callrecord/query/:type/call_record/view",
    //添加, 更新，删除员工请假信息
    AskForLeave: "/rest/callrecord/v2/askforleave",
};

// 获取团队信息
exports.getSaleGroupTeams = function (req, res, params) {
    return restUtil.authRest.get(
        {
            url: restApis.getSaleGroupTeams.replace(":type", params.type),
            req: req,
            res: res
        });
};

// 获取成员信息
exports.getSaleMemberList = function (req, res, params) {
    return restUtil.authRest.get(
        {
            url: restApis.getSaleMemberList.replace(":type", params.type),
            req: req,
            res: res
        });
};
// 获取电话的接通情况
exports.getCallInfo = function (req, res, params, reqData) {
    return restUtil.authRest.get(
        {
            url: restApis.getCallInfo.replace(":type", params.type),
            req: req,
            res: res
        }, reqData);
};
//添加员工请假信息
exports.addAskForLeave = function (req, res ,reqObj) {
    return restUtil.authRest.post(
        {
            url: restApis.AskForLeave,
            req: req,
            res: res
        }, reqObj);
};
//更新员工请假信息
exports.updateAskForLeave = function (req, res ,reqObj) {
    return restUtil.authRest.put(
        {
            url: restApis.AskForLeave,
            req: req,
            res: res
        }, reqObj);
};
//删除某条员工请假信息
exports.deleteAskForLeave = function (req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.AskForLeave + "?ids=" + req.params.id,
            req: req,
            res: res
        });
};