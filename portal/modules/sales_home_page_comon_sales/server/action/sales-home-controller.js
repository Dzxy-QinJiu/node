/**
 * Created by zhangshujuan on 2018/2/27.
 */
"use strict";
//销售主页服务
var salesHomeService = require("../service/sales-home-service");
//获取销售-电话列表
exports.getSalesPhone = function (req, res) {
    salesHomeService.getSalesPhone(req, res, req.query, req.params.type).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/**
 * 获取不同应用即将过期的试用、正式用户列表
 */
exports.getExpireUser = function (req, res) {
    salesHomeService.getExpireUser(req, res).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/*
 * 查询客户
 */
exports.queryContactCustomer = function (req, res) {
    salesHomeService.queryContactCustomer(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        })
        .on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//获取近期登录的客户
exports.getRecentLoginCustomer = function (req, res) {
    salesHomeService.getRecentLoginCustomer(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        })
        .on("error", function (err) {
            res.status(500).json(err.message);
        });
};
//获取即将过期的客户
exports.getWillExpireCustomer = function (req, res) {
    salesHomeService.getWillExpireCustomer(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        })
        .on("error", function (err) {
            res.status(500).json(err.message);
        });
};
//获取近期登录客户的数量
exports.getRecentLoginCustomerCount = function (req, res) {
    salesHomeService.getRecentLoginCustomerCount(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        })
        .on("error", function (err) {
            res.status(500).json(err.message);
        });
};
//获取新分配的客户
exports.getNewDistributeCustomers = function (req, res) {
    salesHomeService.getNewDistributeCustomers(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        })
        .on("error", function (err) {
            res.status(500).json(err.message);
        });
};
