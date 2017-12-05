/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
require('../nock');
//用户管理服务
var userManageService = require("../service/user-manage-service");


/*
 * list log handler.
 */
exports.getLogList = function (req, res) {
    userManageService.getUserLog(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/*
 * show list user handler.
 */
exports.getCurUserList = function (req, res) {
    var params = {}, isGetAllUser = false;
    var curPage = req.query.cur_page, pageSize = req.query.page_size,
        filterContent = req.query.search_content, roleParam = req.query.role_param;
    if (curPage) {
        params.current_page = curPage;
    }
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
        params.role_param = roleParam;
    }
    userManageService.getUsers(req, res, params === {} ? null : params, isGetAllUser).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/*
 * show user detail infor handler.
 */
exports.getCurUserById = function (req, res) {
    userManageService.getCurUserById(req, res, req.params.user_id).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


/**
 * add user handler
 */
exports.addUser = function (req, res) {
    userManageService.addUser(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/**
 * edit user handler
 */
exports.editUser = function (req, res) {
    userManageService.editUser(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


/**
 * edit user team handler
 */
exports.updateUserTeam = function (req, res) {
    userManageService.updateUserTeam(req, res, req.params).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.updateUserRoles = function (req, res) {
    let user = {
        user_id: req.body.user_id,
        role_ids: JSON.parse(req.body.role_ids)
    };
    userManageService.updateUserRoles(req, res, user).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * stop/start user handler
 */
exports.updateUserStatus = function (req, res) {
    userManageService.updateUserStatus(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


/**
 * user roles handler
 */

exports.getRoleList = function (req, res) {
    userManageService.getRoleList(req, res, req.params.client_id).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

//用户名唯一性验证
exports.checkOnlyUserName = function (req, res) {
    userManageService.checkOnlyUserName(req, res, req.params.user_name).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//电话唯一性验证
exports.checkOnlyPhone = function (req, res) {
    userManageService.checkOnlyPhone(req, res, req.params.phone).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//邮箱唯一性验证
exports.checkOnlyEmail = function (req, res) {
    userManageService.checkOnlyEmail(req, res, req.params.email).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};