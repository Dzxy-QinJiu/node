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
// 获取电话的接通情况
exports.getCallInfo = function (req, res) {
    weeklyReportService.getCallInfo(req, res, req.params, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//添加员工请假信息
exports.addAskForLeave = function (req, res) {
    weeklyReportService.addAskForLeave(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//更新员工请假信息
exports.updateAskForLeave = function (req, res) {
    weeklyReportService.updateAskForLeave(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//删除员工请假信息
exports.deleteAskForLeave = function (req, res) {
    weeklyReportService.deleteAskForLeave(req, res).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取合同情况
exports.getContractInfo = function (req, res) {
    weeklyReportService.getContractInfo(req, res, req.params, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取回款情况
exports.getRepaymentInfo = function (req, res) {
    weeklyReportService.getRepaymentInfo(req, res, req.params, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取区域覆盖情况
exports.getRegionOverlayInfo = function (req, res) {
    weeklyReportService.getRegionOverlayInfo(req, res, req.params, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取客户销售阶段情况
exports.getCustomerStageInfo = function (req, res) {
    weeklyReportService.getCustomerStageInfo(req, res, req.params, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};