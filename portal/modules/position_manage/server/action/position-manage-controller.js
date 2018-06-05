'use strict';

//座席号管理服务
var positionManageService = require('../service/position-manage-service');
// 添加座席号
exports.addPhoneOrder = function(req, res) {
    positionManageService.addPhoneOrder(req, res, req.body).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取电话座席号列表
exports.getPhoneOrderList = function(req, res) {
    positionManageService.getPhoneOrderList(req, res, req.query).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取未绑定座席号的成员列表
exports.getUnbindMemberList = function(req, res) {
    positionManageService.getUnbindMemberList(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 修改座席号
exports.updatePhoneOrder = function(req, res) {
    positionManageService.updatePhoneOrder(req, res, req.body).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 成员绑定座席号
exports.memberBindPhoneOrder = function(req, res) {
    positionManageService.memberBindPhoneOrder(req, res, req.body).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};