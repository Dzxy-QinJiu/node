/**
 * Created by xiaojinfeng on 2016/04/08.
 */
"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var salesTeamRestApis = {
    getSalesTeamList: "/rest/base/v1/group/list",
    filterSalesTeamList: "/rest/base/v1/group",
    getMemberList: "/rest/base/v1/group/nonmember",
    addMember: "/rest/base/v1/group/users",
    deleteMember: "/rest/base/v1/group/users",
    editMember: "/rest/base/v1/group/users",
    deleteGroup: "/rest/base/v1/group",
    editGroup: "/rest/base/v1/group",
    addGroup: "/rest/base/v1/group",
    getSalesGoals: "/rest/contract/v2/goal",
    saveSalesGoals: "/rest/contract/v2/goal"
};
exports.urls = salesTeamRestApis;

exports.getSalesTeamList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: salesTeamRestApis.getSalesTeamList,
            req: req,
            res: res
        });
};

exports.getSalesGoals = function (req, res, team_id) {
    return restUtil.authRest.get(
        {
            url: salesTeamRestApis.getSalesGoals,
            req: req,
            res: res
        }, {sales_team_id: team_id});
};
exports.saveSalesGoals = function (req, res, salesGoals) {
    return restUtil.authRest.post(
        {
            url: salesTeamRestApis.saveSalesGoals,
            req: req,
            res: res
        }, salesGoals);
};
exports.filterSalesTeamList = function (req, res, userName) {
    return restUtil.authRest.get(
        {
            url: salesTeamRestApis.filterSalesTeamList + "/" + userName + "/username",
            req: req,
            res: res
        });
};
//转换为界面上所需的数据格式
function turnToFrontMember(data) {
    let frontMemberList = [];
    if (data && data.length > 0) {
        data.forEach(function (member) {
            if (member) {
                frontMemberList.push({
                    userId: member.user_id,
                    nickName: member.nick_name,
                    realmId: member.realm_id,
                    status: member.status,
                    userName: member.user_name,
                    userLogo: member.user_logo
                });
            }
        });
    }
    return frontMemberList;
}
exports.getMemberList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: salesTeamRestApis.getMemberList,
            req: req,
            res: res
        },
        null,
        {
            success: function (eventEmitter, data) {
                data = turnToFrontMember(data);
                eventEmitter.emit("success", data);
            }
        });
};
//flag=false：负责人替换后从该组内删除，true：替换后不删除转为该组的成员
exports.addMember = function (req, res, obj, flag) {
    return restUtil.authRest.post(
        {
            url: salesTeamRestApis.addMember + "/" + flag,
            req: req,
            res: res
        },
        obj);
};

exports.editMember = function (req, res, obj) {
    return restUtil.authRest.put(
        {
            url: salesTeamRestApis.editMember,
            req: req,
            res: res
        },
        obj);
};

exports.deleteGroup = function (req, res, groupId) {
    return restUtil.authRest.del(
        {
            url: salesTeamRestApis.deleteGroup + "/" + groupId,
            req: req,
            res: res
        });
};

exports.editGroup = function (req, res, salesTeam) {
    return restUtil.authRest.put(
        {
            url: salesTeamRestApis.editGroup,
            req: req,
            res: res
        },
        salesTeam);
};

exports.addGroup = function (req, res, salesTeam) {
    return restUtil.authRest.post(
        {
            url: salesTeamRestApis.addGroup,
            req: req,
            res: res
        },
        salesTeam);
};


