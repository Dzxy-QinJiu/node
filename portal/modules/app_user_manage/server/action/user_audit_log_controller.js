
'use strict';

var userAuditLog = require('../service/user_audit_log.service');

// 获取用户审计日志列表
exports.getUserLogList = function(req, res) {
    userAuditLog.getUserLogList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取单个用户审计日志列表
exports.getSingleAuditLogList = function(req, res) {
    userAuditLog.getSingleAuditLogList(req, res, req.query, req.params.user_id).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 用户登录信息（时长、次数、首次和最后一次登录时间）
exports.getUserLoginInfo = function(req, res){
    let obj = req.query;
    obj.user_id = req.params.user_id;
    userAuditLog.getUserLoginInfo(req, res, obj).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//  用户登录统计图中登录时长、登录频次
exports.getUserLoginChartInfo = function(req, res){
    let obj = req.query;
    obj.user_id = req.params.user_id;
    userAuditLog.getUserLoginChartInfo(req, res, obj).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取用户的分数
exports.getLoginUserScore = (req, res) => {
    userAuditLog.getLoginUserScore(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
exports.getLoginUserActiveStatistics = (req, res) => {
    let reqParams = req.query;
    reqParams.user_id = req.params.user_id;
    userAuditLog.getLoginUserActiveStatistics(req, res, reqParams).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

