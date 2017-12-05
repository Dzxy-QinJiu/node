/**
 * Created by wangliping on 2016/10/18.
 */
"use strict";

var OrganizationManageService = require("../service/organization-manage-service");

exports.getOrganizationList = function (req, res) {
    OrganizationManageService.getOrganizationList(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getOrganizeMembersById = function (req, res) {
    var groupId = req.params.group_id;
    OrganizationManageService.getOrganizeMembersById(req, res, groupId)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/**
 * 获取用户列表
 */
exports.getMemberList = function (req, res) {
    OrganizationManageService.getMemberList(req, res, req.query)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


exports.addOrganizeMember = function (req, res) {
    var addMemberObj = {
        group_id: req.body.groupId,
        owner_id: req.body.ownerId,
        user_ids: JSON.parse(req.body.userIds)
    };
    OrganizationManageService.addMember(req, res, addMemberObj)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
};

exports.editOrganizationMember = function (req, res) {
    var editMemberObj = {
        group_id: req.body.groupId,
        user_ids: JSON.parse(req.body.userIds),
        operate: req.body.operate
    };
    OrganizationManageService.editMember(req, res, editMemberObj, req.body.type)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
};

exports.deleteOrganization = function (req, res) {
    var groupId = req.params.group_id;
    OrganizationManageService.deleteGroup(req, res, groupId)
        .on("success", function () {
            res.status(200).json(true);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
};

exports.editOrganization = function (req, res) {
    req.body.user_ids = req.body.user_ids ? JSON.parse(req.body.user_ids) : [];
    OrganizationManageService.editGroup(req, res, req.body)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
};

exports.addOrganization = function (req, res) {
    const organization = {
        group_name: req.body.groupName,
        parent_group: req.body.parentGroup
    }
    const category = req.body.category;
    OrganizationManageService.addGroup(req, res, organization, category)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
};

