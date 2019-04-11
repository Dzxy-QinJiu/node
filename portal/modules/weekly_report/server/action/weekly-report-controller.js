'use strict';
//通话分析
var weeklyReportService = require('../service/weekly-report-service');
var callRateData = [];

// 获取成员信息
exports.getSaleMemberList = function(req, res) {
    weeklyReportService.getSaleMemberList(req, res, req.params).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取电话的接通情况
exports.getCallInfo = function(req, res) {
    weeklyReportService.getCallInfo(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取合同情况
exports.getContractInfo = function(req, res) {
    weeklyReportService.getContractInfo(req, res, req.params, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取回款情况
exports.getRepaymentInfo = function(req, res) {
    weeklyReportService.getRepaymentInfo(req, res, req.params, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取区域覆盖情况
exports.getRegionOverlayInfo = function(req, res) {
    weeklyReportService.getRegionOverlayInfo(req, res, req.params, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取客户销售阶段情况
exports.getCustomerStageInfo = function(req, res) {
    weeklyReportService.getCustomerStageInfo(req, res, req.params, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
