/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';

require('../nock');
//域管理服务
var appManageServic = require('../service/app-manage-service');

/*
 * show list app handler.
 */
exports.getCurAppList = function(req, res) {
    var params = {}, isGetAllApp = false;
    var curPage = req.query.cur_page, pageSize = req.query.page_size;
    var app_name = req.query.app_name, app_desc = req.query.app_desc, tag = req.query.tag, status = req.query.status;
    if (curPage) {
        params.current_page = curPage;
    }
    if (pageSize) {
        params.page_size = pageSize;
    } else {
        params.page_size = 1000;
        isGetAllApp = true;
    }
    if (app_name) {
        params.app_name = app_name;
    }
    if (app_desc) {
        params.app_desc = app_desc;
    }
    if (tag) {
        params.tag = tag;
    }
    if (status) {
        params.status = status;
    }
    appManageServic.getApps(req, res, params === {} ? null : params, isGetAllApp).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

exports.getCurAppById = function(req, res) {
    appManageServic.getCurAppById(req, res, req.params.app_id).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * add app handler
 */
exports.addApp = function(req, res) {
    appManageServic.addApp(req, res, req.body). on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    }
    );
};
/**
 * edit app handler
 */
exports.editApp = function(req, res) {
    appManageServic.editApp(req, res, req.body)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};
