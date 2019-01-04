/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/21.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
const productRestApis = {
    product: '/rest/base/v1/products',
    oplateProductList: '/rest/base/v1/application/oplate',
    matomoProductList: '/rest/base/v1/matomo/sites'
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

// 获取oplate\matomo产品列表
exports.getProductList = function(req, res) {
    let url = '';
    if (req.params.integration_type === 'oplate') {
        url = productRestApis.oplateProductList;
    } else if (req.params.integration_type === 'matomo') {
        url = productRestApis.matomoProductList;
    }
    return restUtil.authRest.get({
        url: url,
        req: req,
        res: res,
    }, req.query, {
        success: function(emitter, data) {
            let responseList = _.map(data, item => {
                if (req.params.integration_type === 'oplate') {
                    return {
                        id: item.client_id,
                        name: item.client_name
                    };
                } else if (req.params.integration_type === 'matomo') {
                    return {
                        id: item.idsite,
                        name: item.name
                    };
                }
            });
            emitter.emit('success', responseList);
        }
    });
};

// 集成oplate\matomo产品
exports.integrateProduct = function(req, res) {
    let url = '';
    if (req.params.integration_type === 'oplate') {
        url = productRestApis.product + '/oplate/';
    } else if (req.params.integration_type === 'matomo') {
        url = productRestApis.product + '/matomo/';
    }
    return restUtil.authRest.post({
        url: url + req.body.ids,
        req: req,
        res: res,
    });
};