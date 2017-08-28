/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
require('../nock');
//域管理服务
var realmManageServic = require("../service/realm-manage-service");

/*
 * show list realm handler.
 */
exports.getCurRealmList = function (req, res) {
    var params = {};
    var curPage = req.query.cur_page, pageSize = req.query.page_size, filterContent = req.query.search_content;
    if (curPage) {
        params.current_page = curPage;
    }
    if (pageSize) {
        params.page_size = pageSize;
    }
    if (filterContent) {
        params.filter_content = filterContent;
    }
    realmManageServic.getRealms(req, res, params === {} ? null : params).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};
exports.getCurRealmById = function (req, res) {
    realmManageServic.getCurRealmById(req, res, req.params.realm_id).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

/**
 * add realm handler
 */
exports.addRealm = function (req, res) {
    realmManageServic.addRealm(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * add owner handler
 */
exports.addOwner = function (req, res) {
    realmManageServic.addOwner(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/**
 * edit realm handler
 */
exports.editRealm = function (req, res) {
    realmManageServic.editRealm(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * start/stop realm handler
 */
exports.updateRealmStatus = function (req, res) {
    realmManageServic.updateRealmStatus(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

