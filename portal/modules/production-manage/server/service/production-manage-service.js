/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/21.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
// 产品配置中过滤ip公共的url
const filterIpCommonUrl = '/rest/base/v1/products/config/';
const productRestApis = {
    checkProductName: '/rest/base/v1/products/list',
    product: '/rest/base/v1/products',
    oplateProductList: '/rest/base/v1/application/oplate',
    matomoProductList: '/rest/base/v1/matomo/sites',
    //uem产品转普通产品，普通产品转uem产品,type=uem\normal
    changeProductType: '/rest/base/v1/products/uem/interconversion/:product_id/:type',
    //集成配置（oplate\matomo）
    integrationConfig: '/rest/base/v1/products/integration/config',
    productionGetFilterIP: filterIpCommonUrl + ':product_id', // 获取产品配置中的ip（后端描述：获取产品的配置，加注释：方便在yapi上查找接口）
    productionAddFilterIP: filterIpCommonUrl + 'filterIP', // 产品配置中增加过滤ip
    productionDeleteFilterIP: filterIpCommonUrl + 'filterIP/:product_id/:ips', // 产品配置中删除过滤ip
};

// 校验产品名称
exports.checkProductName = (req, res) => {
    return restUtil.authRest.get({
        url: productRestApis.checkProductName,
        req: req,
        res: res
    }, req.query);
};

// 获取产品配置中的ip
exports.productionGetFilterIP = (req, res) => {
    return restUtil.authRest.get({
        url: productRestApis.productionGetFilterIP.replace(':product_id',req.params.product_id),
        req: req,
        res: res
    }, null);
};

// 产品配置中增加过滤ip
exports.productionAddFilterIP = (req, res) => {
    return restUtil.authRest.post({
        url: productRestApis.productionAddFilterIP ,
        req: req,
        res: res
    }, req.body);
};

// 产品配置中删除过滤ip
exports.productionDeleteFilterIP = (req, res) => {
    let product_id = req.params.product_id;
    let ips = req.params.ips;
    return restUtil.authRest.del({
        url: productRestApis.productionDeleteFilterIP.replace(':product_id',product_id)
            .replace(':ips', ips) ,
        req: req,
        res: res
    }, null);
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

//通过id获取产品信息
exports.getProductById = function(req, res) {
    return restUtil.authRest.get({
        url: productRestApis.product + '/' + req.params.client_id,
        req: req,
        res: res
    }, {});
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

//修改产品的基本信息
function editProductBasic(req, res, bodyData) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.put(
            {
                url: productRestApis.product,
                req: req,
                res: res
            }, bodyData, {
                success: function(eventEmitter, data) {
                    resolve(data);
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj);
                }
            });
    });
}

//修改产品的集成类型
function editProductType(req, res, id, type) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.put(
            {
                url: productRestApis.changeProductType.replace(':product_id', id).replace(':type', type),
                req: req,
                res: res
            }, {}, {
                success: function(eventEmitter, data) {
                    resolve(data);
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj);
                }
            });
    });
}


//修改产品
exports.updateProduct = function(req, res) {
    let product = req.body;
    let emitter = new EventEmitter();
    let promiseList = [];
    let changeType = product.changeType, isEditBasic = product.isEditBasic;
    //修改集成类型
    if (changeType) {
        promiseList.push(editProductType(req, res, product.id, changeType));
        delete product.changeType;
    }
    //基本信息的修改
    if (isEditBasic) {
        delete product.isEditBasic;
        promiseList.push(editProductBasic(req, res, product));
    }
    Promise.all(promiseList).then((dataList) => {
        let result = {editBasicSuccess: true, editTypeSuccess: true};
        //修改集成类型
        if (changeType) {
            result.editTypeSuccess = _.get(dataList, '[0]');//true\false
        }
        //基本信息的修改
        if (isEditBasic) {
            //也修改了集成类型时
            if (changeType) {
                result.editBasicSuccess = _.get(dataList, '[1]');//true\false
            } else {
                result.editBasicSuccess = _.get(dataList, '[0]');//true\false
            }
        }
        emitter.emit('success', result);
    }, function(errorObj) {
        emitter.emit('error', errorObj);
    });
    return emitter;
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
    let url = `${productRestApis.product}/${req.params.integration_type}/${req.body.ids}`;
    return restUtil.authRest.post({
        url: url,
        req: req,
        res: res,
    });
};

//集成配置（oplate\matomo）
exports.integrationConfig = function(req, res) {
    return restUtil.authRest.post({
        url: productRestApis.integrationConfig,
        req: req,
        res: res,
    }, req.body);
};