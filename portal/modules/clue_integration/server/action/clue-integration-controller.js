/**
 * Created by hzl on 2019/10/14.
 */
'use strict';

import ClueIntegrationService from '../service/clue-integration-service';

// 获取集成线索
exports.getIntegrationList = (req, res) => {
    ClueIntegrationService.getIntegrationList(req, res).on('success',(resData) => {
        res.status(200).json(resData);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 创建销售线索收集产品
exports.createClueIntegration = (req, res) => {
    ClueIntegrationService.createClueIntegration(req, res).on('success',(resData) => {
        res.status(200).json(resData);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 删除数据集成服务
exports.deleteClueIntegration = (req, res) => {
    ClueIntegrationService.deleteClueIntegration(req, res).on('success',(resData) => {
        res.status(200).json(resData);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 修改数据集成服务
exports.changeClueIntegration = (req, res) => {
    ClueIntegrationService.changeClueIntegration(req, res).on('success',(resData) => {
        res.status(200).json(resData);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};