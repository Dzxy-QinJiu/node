/**
 * Created by hzl on 2019/7/2.
 */

'use strict';
const cluePoolService = require('../service/clue-pool-service');

// 获取线索池列表
exports.getCluePoolList = (req, res) => {
    cluePoolService.getCluePoolList(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池负责人
exports.getCluePoolLeading = (req, res) => {
    cluePoolService.getCluePoolLeading(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池来源
exports.getCluePoolSource = (req, res) => {
    cluePoolService.getCluePoolSource(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池接入渠道
exports.getCluePoolChannel = (req, res) => {
    cluePoolService.getCluePoolChannel(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池分类
exports.getCluePoolClassify = (req, res) => {
    cluePoolService.getCluePoolClassify(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', function(err) {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池地域
exports.getCluePoolProvince = (req, res) => {
    cluePoolService.getCluePoolProvince(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', function(err) {
        res.status(500).json(err && err.message);
    });
};

// 单个提取线索
exports.extractClueAssignToSale = (req, res) => {
    cluePoolService.extractClueAssignToSale(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 批量提取线索
exports.batchExtractClueAssignToSale = (req, res) => {
    cluePoolService.batchExtractClueAssignToSale(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};