/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var customerTraceService = require('../service/customer-trace-service');
/*
* 获取客户跟踪记录列表 */
exports.getCustomerTraceList = function(req, res) {
    customerTraceService.getCustomerTraceList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};
//获取跟进记录的分类统计
exports.getCustomerTraceStatistic = function(req, res) {
    customerTraceService.getCustomerTraceStatistic(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
/*
* 添加客户跟踪记录*/
exports.addCustomerTraceList = function(req, res) {
    customerTraceService.addCustomerTraceList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
/*
 * 更新客户跟踪记录*/
exports.updateCustomerTraceList = function(req, res) {
    customerTraceService.updateCustomerTraceList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
/*
 *
 * 获取电话录音*/
exports.getPhoneRecordAudio = function(req, res) {
    customerTraceService.getPhoneRecordAudio(req, res);
};

//微信小程序签到
exports.visitCustomer = function(req,res) {
    customerTraceService.visitCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};