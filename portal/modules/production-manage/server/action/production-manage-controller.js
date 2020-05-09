/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/21.
 */
const productService = require('../service/production-manage-service');
const _ = require('lodash');
// 校验产品名称
exports.checkProductName = (req, res) => {
    productService.checkProductName(req, res).on('success', (data) => {
        // 接口返回得是个对象，可以通过total 进行判断是否重名
        if (_.get(data, 'total')) {
            res.json(true);
        } else {
            res.json(false);
        }
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取产品
exports.getProduct = function(req, res) {
    productService.getProduct(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//通过id获取产品信息
exports.getProductById = function(req, res) {
    productService.getProductById(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加产品
exports.addProduct = function(req,res) {
    productService.addProduct(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 删除产品
exports.deleteProduct = function(req,res) {
    var product = req.params.product;
    productService.deleteProduct(req, res, product).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 修改产品
exports.updateProduct = function(req,res) {
    productService.updateProduct(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加产品
exports.addUemProduct = function(req,res) {
    productService.addUemProduct(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 测试
exports.testUemProduct = function(req,res) {
    productService.testUemProduct(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取oplate\matomo产品列表
exports.getProductList = function(req,res) {
    productService.getProductList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//集成oplate\matomo产品
exports.integrateProduct = function(req,res) {
    productService.integrateProduct(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//集成配置（oplate\matomo）
exports.integrationConfig = function(req,res) {
    productService.integrationConfig(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取产品配置中的ip
exports.productionGetFilterIP = (req,res) => {
    productService.productionGetFilterIP(req, res).on('success', (data) => {
        res.status(200).json(data || {});
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 产品添加过滤IP
exports.productionAddFilterIP = (req,res) => {
    productService.productionAddFilterIP(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 产品删除过滤IP
exports.productionDeleteFilterIP = (req,res) => {
    productService.productionDeleteFilterIP(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};