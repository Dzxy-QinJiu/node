/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/20.
 */

var ApplyApproveManageService = require('../service/self-setting');
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
exports.addSelfSettingApply = function(req, res) {
    ApplyApproveManageService.addSelfSettingApply(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveSelfSettingApply = function(req, res) {
    ApplyApproveManageService.approveSelfSettingApply(req, res).on('success', function(data) {
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
    const filePath = path.resolve(__dirname , `../tpl/${applyId}.bpmn`);
    fs.writeFile(filePath, reqBody.bpmnJson, 'utf-8',(err) => {
        delete reqBody.bpmnJson;
        if (err){
            fs.unlinkSync(filePath);
            res.status(500).json(false);
        }else{
            //再将文件转换成文档流
            var formData = {
                ...reqBody,
                id: applyId,
                file: [fs.createReadStream(filePath)],
            };
            formData.applyApproveRules = JSON.stringify(formData.applyApproveRules);
            if(_.isArray(formData.customiz_user_range)){
                formData.customiz_user_range = JSON.stringify(formData.customiz_user_range);
            }
            if(_.isArray(formData.customiz_team_range)){
                formData.customiz_team_range = JSON.stringify(formData.customiz_team_range);
            }

            ApplyApproveManageService.saveSelfSettingWorkFlowRules(req, res, formData).on('success', function(data) {
                fs.unlinkSync(filePath);
                res.status(200).json(data);
            }).on('error', function(codeMessage) {
                fs.unlinkSync(filePath);
                res.status(500).json(codeMessage && codeMessage.message);
            });
        }
    });
};
exports.getSelfSettingWorkFlow = function(req, res) {
    ApplyApproveManageService.getSelfSettingWorkFlow(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
