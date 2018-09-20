/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/20.
 */
const customerStageService = require('../service/customer-stage-service');
// 获取客户阶段
exports.getCustomerStage = function(req, res) {
    customerStageService.getCustomerStage(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 添加客户阶段
exports.addCustomerStage = function(req,res) {
    customerStageService.addCustomerStage(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 删除客户阶段
exports.deleteCustomerStage = function(req,res) {
    var product = req.params.product;
    customerStageService.deleteCustomerStage(req, res, product).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};