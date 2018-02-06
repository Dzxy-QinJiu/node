"use strict";
//通话分析
var weeklyReportService = require("../service/weekly-report-service");
var callRateData = [];
// 获取团队信息
exports.getSaleGroupTeams = function (req, res) {
    weeklyReportService.getSaleGroupTeams(req, res, req.params).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取成员信息
exports.getSaleMemberList = function (req, res) {
    weeklyReportService.getSaleMemberList(req, res, req.params).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};