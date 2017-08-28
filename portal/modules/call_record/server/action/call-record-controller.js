/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";

//通话记录服务
var callRecordService = require("../service/call-record-service");

/*
 * show list app handler.
 */
exports.getCallRecordList = function (req, res) {
    callRecordService.getCallRecordList(req, res, req.params, req.body,req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

// 编辑通话记录中跟进内容
exports.editCallTraceContent = function(req, res) {
    callRecordService.editCallTraceContent(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

// 搜索电话号码号码时，提供推荐列表
exports.getRecommendPhoneList = function(req, res) {
    callRecordService.getRecommendPhoneList(req, res, req.params, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    }); 
};