/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
'use strict';
//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
const restApis = {
    //获取线索来源
    getClueSource: '/rest/customer/v2/clue/clue_source/100/1',
    //获取线索渠道
    getClueChannel: '/rest/customer/v2/clue/access_channel/100/1',
    //获取线索分类
    getClueClassify: '/rest/customer/v2/clue/clue_classify/100/1',
    //查询线索客户用户查询
    queryCluecustomer: '/rest/customer/v2/clue/query/user',
    //查询线索客户 管理员查询
    queryCluecustomerManager: '/rest/customer/v2/clue/query/manager',
    //添加跟进内容
    addCluecustomerTrace: '/rest/customer/v2/clue/trace',
    //把线索客户分配给对应的销售
    distributeCluecustomerToSale: '/rest/customer/v2/clue/distribute/:type',
    //对线索客户的详情进行更新
    updateCluecustomerDetail: '/rest/customer/v2/clue/update/manager/:updateItem',
    //线索名、电话唯一性验证
    checkOnlySalesClue: '/rest/customer/v2/clue/repeat/search',
    //将线索和客户进行关联
    RelateClueAndCustomer: '/rest/customer/v2/customer/:type/customer_clue_relation',
    //导入线索
    upload: '/rest/customer/v2/clue/upload/preview',
    //确认导入线索预览
    uploadClueConfirm: '/rest/customer/v2/clue/upload/confirm/:flag',
    //删除某条线索
    deleteRepeatClue: 'rest/customer/v2/clue/upload/preview/:index',
    //获取线索分析
    getClueAnalysis: '/rest/analysis/customer/v2/clue/customer/label',
    //获取线索统计
    getClueStatics: '/rest/customer/v2/clue/statistical/:field/:page_size/:num',

};
//查询客户
exports.getClueCustomerList = function(req, res) {
    let queryObj = {};
    queryObj.query = JSON.parse(req.body.clueCustomerTypeFilter);
    let baseUrl = restApis.queryCluecustomer;
    if (req.body.hasManageAuth){
        baseUrl = restApis.queryCluecustomerManager;
    }
    baseUrl = baseUrl + '/' + req.params.pageSize + '/' + req.params.sortField + '/' + req.params.sortOrder;
    if (req.body.lastCustomerId) {
        baseUrl += '?id=' + req.body.lastCustomerId;
    }
    queryObj.rang_params = JSON.parse(req.body.rangParams);
    return restUtil.authRest.post(
        {
            url: baseUrl,
            req: req,
            res: res
        }, queryObj);
};
//获取线索来源
exports.getClueSource = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueSource,
            req: req,
            res: res
        }, null);
};
//获取线索渠道
exports.getClueChannel = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueChannel,
            req: req,
            res: res
        }, null);
};
//获取线索分类
exports.getClueClassify = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueClassify,
            req: req,
            res: res
        }, null);
};
//添加跟进内容
exports.addCluecustomerTrace = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addCluecustomerTrace,
            req: req,
            res: res
        }, req.body);
};
//把线索客户分配给对应的销售
//添加跟进内容
exports.distributeCluecustomerToSale = function(req, res) {
    var queryObj = req.body;
    var type = 'user';
    if (queryObj.hasDistributeAuth){
        type = 'manager';
    }
    delete queryObj.hasDistributeAuth;
    return restUtil.authRest.post(
        {
            url: restApis.distributeCluecustomerToSale.replace(':type',type),
            req: req,
            res: res
        }, queryObj);
};
//对线索客户的详情进行更新
exports.updateCluecustomerDetail = function(req, res) {
    var updateItem = req.body.updateItem;
    if (updateItem === 'weChat'){
        updateItem = 'wechat';
    }
    return restUtil.authRest.put(
        {
            url: restApis.updateCluecustomerDetail.replace(':updateItem', updateItem),
            req: req,
            res: res
        }, JSON.parse(req.body.updateObj));
};

//线索名、电话唯一性验证
exports.checkOnlySalesClue = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.checkOnlySalesClue,
            req: req,
            res: res
        }, req.query);
};
//将线索和客户进行关联
exports.relateClueAndCustomer = function(req, res) {
    return restUtil.authRest.put(
        {
            url: restApis.RelateClueAndCustomer.replace(':type',req.params.type),
            req: req,
            res: res
        }, req.body);
};
//上传线索
exports.uploadClues = function(req, res) {
    return restUtil.authRest.post({
        url: restApis.upload,
        req: req,
        res: res,
        gzip: true,
        'pipe-upload-file': true,
        timeout: uploadTimeOut
    }, null);
};
//上传线索预览
exports.confirmUploadClues = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.uploadClueConfirm.replace(':flag',req.params.flag),
            req: req,
            res: res
        }, null);
};
//删除某个重复线索
exports.deleteRepeatClue = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.deleteRepeatClue.replace(':index',req.params.index),
            req: req,
            res: res
        }, null);
};
//线索分析
exports.getClueAnalysis = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.getClueAnalysis,
            req: req,
            res: res
        }, req.body);
};
function getClueStaticsList(req, res) {
    let queryObj = {};
    queryObj.rang_params = JSON.parse(req.body.rangParams);
    queryObj.query = req.body.query;
    return new Promise((resolve, reject) => {
        return restUtil.authRest.post({
            url: restApis.getClueStatics.replace(':field',req.params.field).replace(':page_size',req.params.page_size).replace(':num',req.params.num),
            req: req,
            res: res
        }, queryObj, {
            success: function(eventEmitter, data) {
                resolve(data);
            },
            error: function(eventEmitter, errorDesc) {
                reject(errorDesc.message);
            }
        });
    });
}
//线索统计
exports.getClueStatics = function(req, res) {
    //有效数据 无效数据 “0” 有效，“1” 无效"
    var emitter = new EventEmitter();
    let getClueStaticsLists = [];
    for (var i = 0; i < 2; i++) {
        req.body.query = {'availability': i + ''};
        getClueStaticsLists.push(getClueStaticsList(req, res));
    }
    Promise.all(getClueStaticsLists).then((dataList) => {
        var responseData = {
            'availabilityData': dataList[0] || [],
            'inavaililityData': dataList[1] || [],
        };
        emitter.emit('success', responseData);
    }).catch((errorMsg) => {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};