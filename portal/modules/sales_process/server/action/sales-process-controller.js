/**
 * Created by hzl on 2019/8/2.
 */
'use strict';
// 销售流程功能模块
const salesProcessService = require('../service/sales-process-service');

// 获取销售流程
exports.getSalesProcess = (req, res) => {
    salesProcessService.getSalesProcess(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加销售流程
exports.addSalesProcess = (req, res) => {
    salesProcessService.addSalesProcess(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 更新销售流程
exports.updateSalesProcess = (req, res) => {
    salesProcessService.updateSalesProcess(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 删除销售流程
exports.deleteSalesProcess = (req, res) => {
    salesProcessService.deleteSalesProcess(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 根据销售流程id获取客户阶段
exports.getCustomerStageBySaleProcessId = (req, res) => {
    salesProcessService.getCustomerStageBySaleProcessId(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加客户阶段
exports.addCustomerStage = (req, res) => {
    salesProcessService.addCustomerStage(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};