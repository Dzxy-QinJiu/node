/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng 2019/09/11.
 */
'use strict';
var clueAssignmentService = require('../service/clue-assignment-service');
const _ = require('lodash');
//保存线索分配策略
exports.saveClueAssignmentStrategy = function(req, res) {
    clueAssignmentService.saveClueAssignmentStrategy(req, res)
        .on('success', function(data) {
            if (_.get(data, 'id')) {
                res.status(200).json(data);
            } else {
                res.status(500).json('添加失败');
            }
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//修改线索分配策略
exports.editClueAssignmentStrategy = function(req, res) {
    clueAssignmentService.editClueAssignmentStrategy(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//删除线索分配策略
exports.deleteClueAssignmentStrategy = function(req, res) {
    clueAssignmentService.deleteClueAssignmentStrategy(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取线索分配策略列表
exports.getClueAssignmentStrategies = function(req, res) {
    clueAssignmentService.getClueAssignmentStrategies(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};