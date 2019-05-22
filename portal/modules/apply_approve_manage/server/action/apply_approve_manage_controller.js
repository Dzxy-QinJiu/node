/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/20.
 */

var ApplyApproveManageService = require('../service/apply_approve_manage-service');
var moment = require('moment');
var _ = require('lodash');
const fs = require('fs');
const path = require('path');
exports.addSelfSettingWorkFlow = function(req, res) {
    ApplyApproveManageService.addSelfSettingWorkFlow(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.editSelfSettingWorkFlow = function(req, res) {
    ApplyApproveManageService.editSelfSettingWorkFlow(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.deleteSelfSettingWorkFlow = function(req, res) {
    ApplyApproveManageService.deleteSelfSettingWorkFlow(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.saveSelfSettingWorkFlowRules = function(req, res) {
    var reqBody = _.cloneDeep(req.body);
    var applyId = req.params.id;
    //将字符串写成临时文件
    // const filePath = path.resolve(__dirname, `${applyId}.bpmn`);
    fs.writeFileSync(`${applyId}.bpmn`, reqBody.bpmnJson, 'utf-8');
    //再将文件转换成文档流
    var formData = {
        ...reqBody,
        id: applyId,
        file: fs.createReadStream(`${applyId}.bpmn`),
    };
    ApplyApproveManageService.saveSelfSettingWorkFlowRules(req, res, formData).on('success', function (data) {
        res.status(200).json(data);
    }).on('error', function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });


};

