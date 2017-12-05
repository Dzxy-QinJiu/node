/**
 * Created by wangliping on 2016/10/18.
 */
"use strict";
const CATEGORY_TYPE = oplateConsts.CATEGORY_TYPE;
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var organizationRestApis = {
    getOrganizationList: "/rest/base/v1/usergroup/list",
    getOrganizationMemberList: "/rest/base/v1/usergroup/users",
    getMemberList: "/rest/base/v1/user/search",
    addMember: "/rest/base/v1/usergroup/user",
    setUserToManager: "/rest/base/v1/usergroup/user/exchange",
    setManagerToUser: "/rest/base/v1/usergroup/manager/exchange",
    deleteGroup: "/rest/base/v1/usergroup",
    editGroup: "/rest/base/v1/usergroup",
    addGroup: "/rest/base/v1/usergroup",
    addDepartment: "/rest/base/v1/usergroup/department",
    addTeam: "/rest/base/v1/usergroup/team"
};
exports.urls = organizationRestApis;

exports.getOrganizationList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: organizationRestApis.getOrganizationList,
            req: req,
            res: res
        });
};

//转换为界面上所需的数据格式
function turnToFrontMember(data) {
    if (data && data.length > 0) {
        data = data.map(function (member) {
            return {
                userId: member.user_id,
                nickName: member.nick_name,
                realmId: member.realm_id,
                status: member.status,
                userName: member.user_name,
                userLogo: member.user_logo
            }
        });

    }
    return data;
}

exports.getOrganizeMembersById = function (req, res, groupId) {
    return restUtil.authRest.get(
        {
            url: organizationRestApis.getOrganizationMemberList + "/" + groupId,
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

//转换为界面上所需的添加成员列表的数据格式
function turnToFrontUser(data) {
    if (data && data.length > 0) {
        data = data.map(function (userObj) {
            if (userObj && userObj.user) {
                return {
                    key: userObj.user.user_id,
                    nickName: userObj.user.nick_name,
                    userName: userObj.user.user_name,
                    description: userObj.user.description
                }
            }
        });
    }
    return data;
}
exports.getMemberList = function (req, res, queryObj) {
    return restUtil.authRest.get(
        {
            url: organizationRestApis.getMemberList,
            req: req,
            res: res
        },
        queryObj,
        {
            success: function (eventEmitter, data) {
                data.data = turnToFrontUser(data.data);
                eventEmitter.emit("success", data);
            }
        });
};

exports.addMember = function (req, res, obj) {
    return restUtil.authRest.post(
        {
            url: organizationRestApis.addMember,
            req: req,
            res: res
        },
        obj);
};

exports.editMember = function (req, res, obj, type) {
    let url = organizationRestApis.setUserToManager;
    if (type == "manager") {
        url = organizationRestApis.setManagerToUser;
    }
    return restUtil.authRest.put(
        {
            url: url,
            req: req,
            res: res
        },
        obj);
};

exports.deleteGroup = function (req, res, groupId) {
    return restUtil.authRest.del(
        {
            url: organizationRestApis.deleteGroup + "/" + groupId,
            req: req,
            res: res
        });
};

exports.editGroup = function (req, res, organization) {
    return restUtil.authRest.put(
        {
            url: organizationRestApis.editGroup,
            req: req,
            res: res
        },
        organization);
};

exports.addGroup = function (req, res, organization, category) {
    let addUrl = organizationRestApis.addGroup;
    if (category == CATEGORY_TYPE.DEPARTMENT) {
        //部门
        addUrl = organizationRestApis.addDepartment;
    } else if (category == CATEGORY_TYPE.TEAM) {
        //团队
        addUrl = organizationRestApis.addTeam;
    }
    return restUtil.authRest.post(
        {
            url: addUrl,
            req: req,
            res: res
        },
        organization);
};


