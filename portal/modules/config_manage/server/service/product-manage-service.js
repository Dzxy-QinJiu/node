/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/21.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);

const productRestApis = {
    product: ' /rest/base/v1/products'
};

//获取产品列表
exports.getProduct = function(req, res) {
    return restUtil.authRest.get({
        url: productRestApis.product + '/list',
        req: req,
        res: res
    }, {page_size: 100});
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
