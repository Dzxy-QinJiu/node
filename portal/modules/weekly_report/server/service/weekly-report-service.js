"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
const restApis = {
    // 获取团队信息
    getSaleGroupTeams: '/rest/base/v1/group/teams/:type',
    // 获取成员信息
    getSaleMemberList: '/rest/base/v1/group/team/members/:type',
}

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