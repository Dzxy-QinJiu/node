'use strict';
// 成员管理服务
const memberManageService = require('../service/member-manage-service');
const BackendIntl = require('../../../../lib/utils/backend_intl');
const _ = require('lodash');
function handleMemberReqData(req, res) {
    let params = {};
    let isGetAllUser = false;
    let pageSize = req.query.pageSize;
    let filterContent = req.query.searchContent;
    let roleParam = req.query.roleParam;
    let status = req.query.status;
    let teamrole_id = req.query.teamrole_id;
    if (pageSize) {
        params.page_size = pageSize;
    } else {
        //不传pageSize时取所有
        isGetAllUser = true;
        params.page_size = 1000;
    }
    if (filterContent) {
        params.filter_content = filterContent;
    }
    if (roleParam) {
        params.role_id = roleParam;
    }
    if (status) {
        params.status = status;
    }
    //用于下拉加载的接口，翻页的接口里传了也不受影响
    if(req.query.id){
        params.id = req.query.id;
    }
    return {
        params: _.isEmpty(params) ? null : params,
        isGetAllUser: isGetAllUser,
        teamrole_id: teamrole_id
    };
}
// 获取成员列表
exports.getMemberList = (req, res) => {
    var submitObj = handleMemberReqData(req, res);
    var params = submitObj.params, isGetAllUser = submitObj.isGetAllUser, teamrole_id = submitObj.teamrole_id;
    memberManageService.getMemberList(req, res, params, isGetAllUser, teamrole_id).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取不同角色的成员列表
exports.getMemberListByRoles = (req, res) => {
    var submitObj = handleMemberReqData(req, res);
    var params = submitObj.params, isGetAllUser = submitObj.isGetAllUser, teamrole_id = submitObj.teamrole_id;
    memberManageService.getMemberListByRoles(req, res, params, isGetAllUser, teamrole_id).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getLogList = function(req, res) {
    memberManageService.getUserLog(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/*
 * show user detail infor handler.
 */
exports.getCurUserById = function(req, res) {
    memberManageService.getCurUserById(req, res, req.params.user_id).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


/**
 * add user handler
 */
exports.addUser = function(req, res) {
    memberManageService.addUser(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/**
 * edit user handler
 */
exports.editUser = function(req, res) {
    memberManageService.editUser(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


/**
 * edit user team handler
 */
exports.updateUserTeam = function(req, res) {
    memberManageService.updateUserTeam(req, res, req.params).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 清空成员的部门
exports.clearMemberDepartment = (req, res) => {
    memberManageService.clearMemberDepartment(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


exports.updateUserRoles = function(req, res) {
    let user = {
        user_id: req.body.user_id,
        role_ids: JSON.parse(req.body.role_ids)
    };
    memberManageService.updateUserRoles(req, res, user).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * stop/start user handler
 */
exports.updateUserStatus = function(req, res) {
    if (req.session.user && req.session.user.userid && req.session.user.userid === req.body.id) {
        let backendIntl = new BackendIntl(req);
        res.status(500).json(backendIntl.get('member.forbidden.self', '禁止禁用自己'));
    } else {
        memberManageService.updateUserStatus(req, res, req.body).on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
    }
};


/**
 * user roles handler
 */

exports.getRoleList = function(req, res) {
    memberManageService.getRoleList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

//昵称（对应的是姓名）唯一性验证
exports.checkOnlyNickName = (req, res) => {
    memberManageService.checkOnlyNickName(req, res, req.params.nickname).on('success', (data) => {
        if (data && data.account_nickname) {
            // 昵称（对应的是姓名）已存在，返回true
            res.status(200).json(true);
        } else {
            // 昵称（对应的是姓名）不存在，返回false
            res.status(200).json(false);
        }
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 用户名唯一性验证
exports.checkOnlyUserName = function(req, res) {
    memberManageService.checkOnlyUserName(req, res, req.params.username).on('success', function(data) {
        if (data && data.user_name) {
            // 用户名已存在，返回true
            res.status(200).json(true);
        } else {
            // 用户名不存在，返回false
            res.status(200).json(false);
        }
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//电话唯一性验证
exports.checkOnlyPhone = function(req, res) {
    memberManageService.checkOnlyPhone(req, res, req.params.phone).on('success', function(data) {
        if (data && data.phone) {
            // 电话已存在，返回true
            res.status(200).json(true);
        } else {
            // 电话不存在，返回false
            res.status(200).json(false);
        }
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//邮箱唯一性验证
exports.checkOnlyEmail = function(req, res) {
    memberManageService.checkOnlyEmail(req, res, req.params.email).on('success', function(data) {
        if (data && data.email) {
            // 邮箱已存在，返回true
            res.status(200).json(true);
        } else {
            // 邮箱不存在，返回false
            res.status(200).json(false);
        }
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取销售目标和提成比例
exports.getSalesGoals = function(req, res) {
    memberManageService.getSalesGoals(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};
exports.setSalesGoals = function(req, res) {
    memberManageService.setSalesGoals(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

// 获取成员变动记录
exports.getMemberChangeRecord = (req, res) => {
    memberManageService.getMemberChangeRecord(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err.message);
    });
};