/**
 * Created by zhangshujuan on 2018/2/27.
 */
'use strict';
//销售主页服务
var salesHomeService = require('../service/sales-home-service');
//获取销售-电话列表
exports.getSalesPhone = function(req, res) {
    salesHomeService.getSalesPhone(req, res, req.query, req.params.type).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/*
 * 查询客户
 */
exports.queryContactCustomer = function(req, res) {
    salesHomeService.queryContactCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//获取即将过期或者过期的客户
exports.getExpireCustomer = function(req, res) {
    salesHomeService.getExpireCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err.message);
        });
};
