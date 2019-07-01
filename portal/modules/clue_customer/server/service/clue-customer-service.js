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
const _ = require('lodash');
const clueBaseUrl = '/rest/clue/v2';
const restApis = {
    //获取线索来源
    getClueSource: clueBaseUrl + '/clue_source/100/1',
    //获取线索渠道
    getClueChannel: clueBaseUrl + '/access_channel/100/1',
    //获取线索分类
    getClueClassify: clueBaseUrl + '/clue_classify/100/1',
    //查询线索客户用户查询
    queryCluecustomer: clueBaseUrl + '/query/user',
    //查询线索客户 管理员查询
    queryCluecustomerManager: clueBaseUrl + '/query/manager',
    //添加跟进内容
    addCluecustomerTrace: clueBaseUrl + '/trace',
    //把线索客户分配给对应的销售
    distributeCluecustomerToSale: clueBaseUrl + '/distribute/:type',
    //对线索客户的详情进行更新
    updateCluecustomerDetail: clueBaseUrl + '/update/:type/:updateItem',
    //将线索和客户进行关联
    RelateClueAndCustomer: clueBaseUrl + '/:type/customer_clue_relation',
    //导入线索
    upload: clueBaseUrl + '/upload/preview',
    //确认导入线索预览
    uploadClueConfirm: clueBaseUrl + '/upload/confirm/:flag',
    //删除某条线索
    deleteRepeatClue: clueBaseUrl + '/upload/preview/:index',
    //获取线索分析
    getClueAnalysis: '/rest/analysis/customer/v2/clue/customer/label',
    //获取线索统计
    getClueStatics: clueBaseUrl + '/:type/statistical/:field/:page_size/:num',
    //获取线索趋势统计
    getClueTrendStatics: '/rest/analysis/customer/v2/:type/clue/trend/statistic',
    //线索的全文搜索
    getClueFulltext: clueBaseUrl + '/query/lead/range/fulltext/:type/:page_size/:sort_field/:order',
    //有待我处理筛选项时的全文搜索
    getClueFullTextWithSelfHandle: clueBaseUrl + '/query/self_no_traced/range/fulltext/:type/:page_size/:sort_field/:order',
    //获取线索的动态
    getClueDynamic: clueBaseUrl + '/dynamic/:clue_id/:page_size',
    //根据线索的id查询线索的详情
    getClueDetailById: clueBaseUrl + '/query/clue/:clueId',
    //删除某个线索
    deleteClueById: clueBaseUrl + '/delete',
    //批量修改线索的跟进人
    changeClueSalesBatch: clueBaseUrl + '/distribute/:type/batch/new',
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
    queryObj.rang_params = JSON.parse(req.body.rangeParams);
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

exports.changeClueSalesBatch = function(req, res) {
    var queryObj = handleBatchClueSalesParams(req,restApis.changeClueSalesBatch);
    req.body.query_param = queryObj.bodyObj;
    return restUtil.authRest.post(
        {
            url: queryObj.url,
            req: req,
            res: res
        }, req.body);
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
    return restUtil.authRest.put(
        {
            url: restApis.updateCluecustomerDetail.replace(':type', req.body.type).replace(':updateItem', updateItem),
            req: req,
            res: res
        }, JSON.parse(req.body.updateObj));
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
exports.uploadClues = function(req, res, formData) {
    return restUtil.authRest.post({
        url: restApis.upload,
        req: req,
        res: res,
        formData: formData,
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
exports.getClueStatics = function(req, res) {
    let queryObj = {};
    queryObj.rang_params = JSON.parse(req.body.rangeParams);
    //销售取值时，query参数必须有，管理员可以没有
    if (req.body.query){
        queryObj.query = JSON.parse(req.body.query);
    }else{
        queryObj.query = {};
    }
    return restUtil.authRest.post({
        url: restApis.getClueStatics.replace(':type',req.params.type).replace(':field',req.params.field).replace(':page_size',req.params.page_size).replace(':num',req.params.num),
        req: req,
        res: res
    }, queryObj);

};
//线索趋势统计
exports.getClueTrendStatics = function(req, res) {
    var url = restApis.getClueTrendStatics.replace(':type', req.params.type);
    if (req.body.start_time || req.body.start_time === 0){
        url += `?start_time=${req.body.start_time}`;
    }
    if (req.body.end_time){
        url += `&end_time=${req.body.end_time}`;
    }
    if (req.body.field){
        url += `&field=${req.body.field}`;
    }
    if (req.body.interval){
        url += `&interval=${req.body.interval}`;
    }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null);
};
function handleBatchClueSalesParams(req, clueUrl) {
    var reqBody = req.body.query_param;
    var rangeParams = _.isString(reqBody.rangeParams) ? JSON.parse(reqBody.rangeParams) : reqBody.rangeParams;
    var typeFilter = _.isString(reqBody.typeFilter) ? JSON.parse(reqBody.typeFilter) : reqBody.typeFilter;
    var url = clueUrl.replace(':type',req.params.type);
    var keyword = '';
    if (reqBody.keyword){
        keyword = encodeURI(reqBody.keyword);
    }
    var bodyObj = {
        query: {...typeFilter},
        rangeParams: rangeParams,
    };
    if (keyword){
        bodyObj.keyword = keyword;
    }
    if (reqBody.userId){
        bodyObj.query.userId = reqBody.userId;
    }
    if (reqBody.id){
        bodyObj.query.id = reqBody.id;
    }
    if (reqBody.clue_source){
        bodyObj.query.clue_source = reqBody.clue_source;
    }
    if (reqBody.access_channel){
        bodyObj.query.access_channel = reqBody.access_channel;
    }
    if (reqBody.clue_classify){
        bodyObj.query.clue_classify = reqBody.clue_classify;
    }
    if (reqBody.availability){
        bodyObj.query.availability = reqBody.availability;
    }
    if (reqBody.province){
        bodyObj.query.province = reqBody.province;
    }
    var exist_fields = reqBody.exist_fields ? JSON.parse(reqBody.exist_fields) : [];
    var unexist_fields = reqBody.unexist_fields ? JSON.parse(reqBody.unexist_fields) : [];
    if (_.isArray(exist_fields) && exist_fields.length){
        bodyObj.exist_fields = exist_fields;
    }
    if (_.isArray(unexist_fields) && unexist_fields.length){
        bodyObj.unexist_fields = unexist_fields;
    }
    if(reqBody.self_no_traced){
        url += `?self_no_traced=${reqBody.self_no_traced}`;
    }
    return {url: url, bodyObj: bodyObj};
}
function handleClueParams(req, clueUrl) {
    var reqBody = req.body;
    if (_.isString(req.body.reqData)){
        reqBody = JSON.parse(req.body.reqData);
    }
    var rangeParams = _.isString(reqBody.rangeParams) ? JSON.parse(reqBody.rangeParams) : reqBody.rangeParams;
    var typeFilter = _.isString(reqBody.typeFilter) ? JSON.parse(reqBody.typeFilter) : reqBody.typeFilter;
    var url = clueUrl.replace(':type',req.params.type).replace(':page_size',req.params.page_size).replace(':order',req.params.order);
    if (rangeParams[0].from){
        url += `?start_time=${rangeParams[0].from}`;
    }
    if (rangeParams[0].to){
        url += `&end_time=${rangeParams[0].to}`;
    }
    if (reqBody.keyword){
        var keyword = encodeURI(reqBody.keyword);
        url += `&keyword=${keyword}`;
    }
    if (reqBody.statistics_fields){
        url += `&statistics_fields=${reqBody.statistics_fields}`;
    }
    if (reqBody.lastClueId){
        url += `&id=${reqBody.lastClueId}`;
    }
    var bodyObj = {
        query: {...typeFilter},
    };
    if (reqBody.userId){
        bodyObj.query.userId = reqBody.userId;
    }
    if (reqBody.id){
        bodyObj.query.id = reqBody.id;
    }
    if (reqBody.clue_source){
        bodyObj.query.clue_source = reqBody.clue_source;
    }
    if (reqBody.access_channel){
        bodyObj.query.access_channel = reqBody.access_channel;
    }
    if (reqBody.clue_classify){
        bodyObj.query.clue_classify = reqBody.clue_classify;
    }
    if (reqBody.availability){
        bodyObj.query.availability = reqBody.availability;
    }
    if (reqBody.province){
        bodyObj.query.province = reqBody.province;
    }
    var exist_fields = reqBody.exist_fields ? JSON.parse(reqBody.exist_fields) : [];
    var unexist_fields = reqBody.unexist_fields ? JSON.parse(reqBody.unexist_fields) : [];
    if (_.isArray(exist_fields) && exist_fields.length){
        bodyObj.exist_fields = exist_fields;
        //如果是查询重复线索，要按repeat_id排序
        if (_.indexOf(exist_fields,'repeat_id') > -1){
            url = url.replace(':sort_field', 'repeat_id');
        }else {
            url = url.replace(':sort_field',req.params.sort_field);
        }
    }else {
        url = url.replace(':sort_field',req.params.sort_field);
    }
    if (_.isArray(unexist_fields) && unexist_fields.length){
        bodyObj.unexist_fields = unexist_fields;
    }
    return {url: url, bodyObj: bodyObj};
}
//线索全文搜索
exports.getClueFulltext = function(req, res) {
    var obj = handleClueParams(req, restApis.getClueFulltext);
    return restUtil.authRest.post({
        url: obj.url,
        req: req,
        res: res
    },obj.bodyObj);
};
//线索有待我处理筛选项时的全文搜索
exports.getClueFulltextSelfHandle = function(req, res) {
    var obj = handleClueParams(req, restApis.getClueFullTextWithSelfHandle);
    return restUtil.authRest.post({
        url: obj.url,
        req: req,
        res: res
    },obj.bodyObj);
};
//获取动态列表
exports.getDynamicList = function(req, res) {
    var url = restApis.getClueDynamic.replace(':clue_id',req.params.clue_id).replace(':page_size',req.params.page_size);
    //todo 现在后端接口的下拉加载有问题
    // if (req.query.id){
    //     url += `?id=${req.query.id}`
    // }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null);
};
//删除某条线索
exports.deleteClue = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.deleteClueById,
            req: req,
            res: res
        }, req.body);
};
//根据线索的id获取线索的详情
exports.getClueDetailById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueDetailById.replace(':clueId', req.params.clueId),
            req: req,
            res: res
        }, null);
};