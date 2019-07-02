/**
 * Created by hzl on 2019/7/2.
 */
'use strict';

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
const commonUrl = '/rest/clue/v2/lead_pool/';

const restApis = {
    // 获取线索池列表
    getCluePoolList: commonUrl + 'query/range/fulltext/:type/:sort_field/:page_size/:order',
    // 获取线索池中的负责人（user_name）、来源（clue_source）、接入渠道（access_channel）、线索分类（clue_classify）、地域（province）
    cluePoolFilterURL: commonUrl + 'term/:field',
    // 单个提取线索
    extractClueAssignToSale: commonUrl + 'lead/extract/:lead_id/:member_id',
    // 批量提取线索
    batchExtractClueAssignToSale: commonUrl + 'lead/:type/batch/extract',
};

// 处理线索池中列表的参数
function handleClueParams(req, clueUrl) {
    let reqBody = req.body;
    if (_.isString(req.body.reqData)){
        reqBody = JSON.parse(req.body.reqData);
    }
    let rangeParams = _.isString(reqBody.rangeParams) ? JSON.parse(reqBody.rangeParams) : reqBody.rangeParams;
    let typeFilter = _.isString(reqBody.typeFilter) ? JSON.parse(reqBody.typeFilter) : reqBody.typeFilter;
    let url = clueUrl.replace(':type',req.params.type).replace(':page_size',req.params.page_size).replace(':order',req.params.order);
    if (rangeParams[0].from){
        url += `?start_time=${rangeParams[0].from}`;
    }
    if (rangeParams[0].to){
        url += `&end_time=${rangeParams[0].to}`;
    }
    if (reqBody.keyword){
        let keyword = encodeURI(reqBody.keyword);
        url += `&keyword=${keyword}`;
    }

    if (reqBody.lastClueId){
        url += `&id=${reqBody.lastClueId}`;
    }
    let bodyObj = {
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
    let exist_fields = reqBody.exist_fields ? JSON.parse(reqBody.exist_fields) : [];
    let unexist_fields = reqBody.unexist_fields ? JSON.parse(reqBody.unexist_fields) : [];
    if (_.isArray(exist_fields) && exist_fields.length){
        bodyObj.exist_fields = exist_fields;
        //如果是查询重复线索，要按repeat_id排序
        if (_.indexOf(exist_fields,'repeat_id') > -1){
            url = url.replace(':sort_field', 'repeat_id');
        }else {
            url = url.replace(':sort_field',req.params.sort_field);
        }
    } else {
        url = url.replace(':sort_field',req.params.sort_field);
    }
    if (_.isArray(unexist_fields) && unexist_fields.length){
        bodyObj.unexist_fields = unexist_fields;
    }
    return {url: url, bodyObj: bodyObj};
}

// 获取线索池列表
exports.getCluePoolList = (req, res) => {
    const obj = handleClueParams(req, restApis.getCluePoolList);
    return restUtil.authRest.post({
        url: obj.url,
        req: req,
        res: res
    },obj.bodyObj);
};

// 获取线索池负责人
exports.getCluePoolLeading = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.cluePoolFilterURL.replace(':field','user_name'),
            req: req,
            res: res
        }, null);
};

// 获取线索池来源
exports.getCluePoolSource = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.cluePoolFilterURL.replace(':field','clue_source'),
            req: req,
            res: res
        }, null);
};

// 获取线索池接入渠道
exports.getCluePoolChannel = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.cluePoolFilterURL.replace(':field','access_channel'),
            req: req,
            res: res
        }, null);
};

// 获取线索池分类
exports.getCluePoolClassify = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.cluePoolFilterURL.replace(':field','access_channel'),
            req: req,
            res: res
        }, null);
};

// 获取线索池地域
exports.getCluePoolProvince = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.cluePoolFilterURL.replace(':field','access_channel'),
            req: req,
            res: res
        }, null);
};

// 单个提取线索
exports.extractClueAssignToSale = (req, res) => {
    let id = req.params.id;
    let saleId = req.params.sale_id;
    let url = restApis.extractClueAssignToSale.replace(':lead_id',id).replace(':member_id',saleId);
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, null);
};

// 批量提取线索
exports.batchExtractClueAssignToSale = (req, res) => {
    let type = req.params.type;
    let url = restApis.batchExtractClueAssignToSale.replace(':type',type);
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, req.body);
};