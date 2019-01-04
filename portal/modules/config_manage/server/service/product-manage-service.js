/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/21.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);

const productRestApis = {
    product: '/rest/base/v1/products',
    application: '/rest/base/v1/application',
};

//获取产品列表
exports.getProduct = function(req, res) {
    let query = req.query || {page_size: 1000};
    return restUtil.authRest.get({
        url: productRestApis.product + '/list',
        req: req,
        res: res
    }, query);
};
//添加产品
exports.addProduct = function(req, res, product) {
    return restUtil.authRest.post({
        url: productRestApis.product,
        req: req,
        res: res
    }, product);
};
//删除产品
exports.deleteProduct = function(req, res, productId) {
    return restUtil.authRest.del({
        url: productRestApis.product + '/' + encodeURI(productId),
        req: req,
        res: res
    }, null);
};
//修改产品
exports.updateProduct = function(req, res, product) {
    return restUtil.authRest.put({
        url: productRestApis.product,
        req: req,
        res: res
    }, product);
};

//添加uem产品
exports.addUemProduct = function(req, res) {
    return restUtil.authRest.post({
        url: productRestApis.product + '/uem',
        req: req,
        res: res
    }, req.body);
};

// 测试
exports.testUemProduct = function(req, res) {
    return restUtil.authRest.get({
        url: productRestApis.product + '/uem/test',
        req: req,
        res: res
    }, req.query);
};

// 获取js代码
exports.getUemJsCode = function(req, res) {
    return restUtil.authRest.get({
        url: productRestApis.product + '/uem/js',
        req: req,
        res: res,
    }, req.query);
};

// 获取oplate产品列表
exports.getOplateProductList = function(req, res) {
    return restUtil.authRest.get({
        url: productRestApis.application + '/oplate',
        req: req,
        res: res,
    }, req.query);
};

// 集成oplate产品
exports.integrateOplateProduct = function(req, res) {
    return restUtil.authRest.post({
        url: productRestApis.product + '/oplate/' + req.body.ids,
        req: req,
        res: res,
    });
};