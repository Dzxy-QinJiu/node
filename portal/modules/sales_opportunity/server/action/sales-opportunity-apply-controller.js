/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var SalesOpportunityApplyService = require('../service/sales-opportunity-apply-service');

exports.getAllSalesOpportunityApplyList = function(req, res) {
    SalesOpportunityApplyService.getAllSalesOpportunityApplyList(req, res).on('success', function(data) {
        data = handleNodata(data);
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addSalesOpportunityApply = function(req, res) {
    SalesOpportunityApplyService.addSalesOpportunityApply(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveSalesOpportunityApplyPassOrReject = function(req, res) {
    SalesOpportunityApplyService.approveSalesOpportunityApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.getSalesOpportunityApplyStatusById = function(req, res) {
    SalesOpportunityApplyService.getSalesOpportunityApplyStatusById(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};