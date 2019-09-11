/**
 * Created by xiaojinfeng on 2016/04/08.
 */
'use strict';

var SalesTeamManageServic = require('../service/sales-team-manage-service');

// 根据组织属性获取组织信息，用来判断是否重名
exports.getOrganizationInfoByName = (req, res) => {
    SalesTeamManageServic.getOrganizationInfoByName(req, res).on('success', (data) => {
        if (data && data.name) { // 重名，返回true
            res.status(200).json(true);
        } else {
            res.status(200).json(false);
        }
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.filterSalesTeamList = function(req, res) {
    var userName = encodeURI(req.params.user_name);
    SalesTeamManageServic.filterSalesTeamList(req, res, userName)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

exports.getSalesGoals = function(req, res) {
    SalesTeamManageServic.getSalesGoals(req, res, req.params.team_id)
        .on('success', function(data) {
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(200).json({});
            }
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

exports.saveSalesGoals = function(req, res) {
    SalesTeamManageServic.saveSalesGoals(req, res, req.body)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

exports.getMemberList = function(req, res) {
    SalesTeamManageServic.getMemberList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};


exports.addMember = function(req, res) {
    var addMemberObj = {
        group_id: req.body.groupId,
        user_ids: JSON.parse(req.body.userIds)
    };
    SalesTeamManageServic.addMember(req, res, addMemberObj)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};

exports.editMember = function(req, res) {
    SalesTeamManageServic.editMember(req, res, req.body)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};

exports.deleteGroup = function(req, res) {
    var groupId = req.params.group_id;
    SalesTeamManageServic.deleteGroup(req, res, groupId)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};

exports.editGroup = function(req, res) {
    req.body.user_ids = req.body.user_ids ? JSON.parse(req.body.user_ids) : [];
    SalesTeamManageServic.editGroup(req, res, req.body)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};

exports.addGroup = function(req, res) {
    let bodyData = req.body;
    let salesTeam = {
        group_name: bodyData.groupName
    };
    if (bodyData.parentGroup) {
        salesTeam.parent_group = bodyData.parentGroup;
    }
    SalesTeamManageServic.addGroup(req, res, salesTeam)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};

