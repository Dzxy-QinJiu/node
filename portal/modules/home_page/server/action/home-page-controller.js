/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/21.
 */
const homPageService = require('../service/home-page-service');

//获取我的工作列表
exports.getMyWorkList = function(req, res) {
    homPageService.getMyWorkList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//获取我的工作类型
exports.getMyWorkTypes = function(req, res) {
    homPageService.getMyWorkTypes(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//处理我的工作状态
exports.handleMyWorkStatus = function(req, res) {
    homPageService.handleMyWorkStatus(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//获取业绩排名
exports.getContractPerformance = function(req, res) {
    homPageService.getContractPerformance(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//获取通话时长数据
exports.getCallTimeData = function(req, res) {
    homPageService.getCallTimeData(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//获取已联系客户数
exports.getContactCustomerCount = function(req, res) {
    homPageService.getContactCustomerCount(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//获取我关注的数据
exports.getMyInterestData = function(req, res) {
    homPageService.getMyInterestData(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//我关注的数据的处理
exports.updateMyInterestStatus = function(req, res) {
    homPageService.updateMyInterestStatus(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
