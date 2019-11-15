/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/28.
 */
const payService = require('../service/pay');

//获取客套商品列表
exports.getCurtaoGoodsList = function(req, res) {
    payService.getCurtaoGoodsList(req, res).on('success' , function(data) {
        res.status(200).json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//商品交易
exports.goodsTrade = function(req, res) {
    payService.goodsTrade(req, res).on('success' , function(data) {
        res.status(200).json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//订单交易状态
exports.getOrderStatus = function(req, res) {
    payService.getOrderStatus(req, res).on('success' , function(data) {
        res.status(200).json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取支付渠道信息
exports.getPaymentMode = function(req, res) {
    payService.getPaymentMode(req, res).on('success' , function(data) {
        res.status(200).json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取支付渠道信息
exports.getGoodsDiscountList = function(req, res) {
    payService.getGoodsDiscountList(req, res).on('success' , function(data) {
        res.status(200).json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取组织的通话费用
exports.getOrganizationCallFee = (req, res) => {
    payService.getOrganizationCallFee(req, res).on('success' , (data) => {
        res.status(200).json(data);
    }).on('error' , (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};