/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';
var cprService = require('../service/customer-pool-rule-service');
var _ = require('lodash');

/*
 * show customer label list handler.
 */
exports.getCustomerLabel = function(req, res) {
    cprService.getCustomerLabel(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

/*
 * show customer stage list handler.
 */
exports.getCustomerStage = function(req, res) {
    cprService.getCustomerStage(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

/*
 * show customer pool configs list handler.
 */
exports.getCustomerPoolConfigs = function(req, res) {
    cprService.getCustomerPoolConfigs(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

/*
 * add customer pool config handler.
 */
exports.addCustomerPoolConfig = function(req, res) {
    cprService.addCustomerPoolConfig(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

/*
 * update customer pool config handler.
 */
exports.updateCustomerPoolConfig = function(req, res) {
    cprService.updateCustomerPoolConfig(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

/*
 * delete customer pool config handler.
 */
exports.deleteCustomerPoolConfig = function(req, res) {
    cprService.deleteCustomerPoolConfig(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};