/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/10.
 */
var ApplyApproveService = require('../service/apply-approve');
var _ = require('lodash');
var applyDto = require('../../../app_user_manage/server/dto/apply');
exports.getNextCandidate = function(req, res) {
    ApplyApproveService.getNextCandidate(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addNewCandidate = function(req, res) {
    ApplyApproveService.addNewCandidate(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addUserApplyNewCandidate = function(req, res) {
    ApplyApproveService.addUserApplyNewCandidate(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.getApplyListApprovedByMe = function(req, res) {
    ApplyApproveService.getApplyListApprovedByMe(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getApplyTaskNode = function(req, res) {
    ApplyApproveService.getApplyTaskNode(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// exports.getApplyDetailById = function(req, res) {
//     ApplyApproveService.getApplyDetailById(req, res).on('success', function(data) {
//         res.status(200).json(data);
//     }).on('error', function(codeMessage) {
//         res.status(500).json(codeMessage && codeMessage.message);
//     });
// };