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
    // 根据线索的id获取线索的详情
    getClueDetailById: commonUrl + '/query/lead_pool_id/:lead_pool_id',
};
function handleCluePram(req, clueUrl) {
    var reqBody = _.cloneDeep(req.body);
    //有导出的线索会用这个条件
    if (_.isString(req.body.reqData)){
        reqBody = JSON.parse(req.body.reqData);
    }
    var url = clueUrl.replace(':type',req.params.type).replace(':page_size',req.params.page_size).replace(':order',req.params.order);
    var queryParams = _.get(reqBody,'queryParam');
    var rangeParams = _.get(queryParams,'rangeParams');
    if (rangeParams[0].from){
        url += `?start_time=${rangeParams[0].from}`;
    }
    if (rangeParams[0].to){
        url += `&end_time=${rangeParams[0].to}`;
    }
    if (queryParams.keyword){
        var keyword = encodeURI(queryParams.keyword);
        url += `&keyword=${keyword}`;
    }

    if (queryParams.statistics_fields){
        url += `&statistics_fields=${queryParams.statistics_fields}`;
    }
    if (queryParams.id){
        url += `&id=${queryParams.id}`;
    }
    var bodyParams = _.get(reqBody,'bodyParam');
    var exist_fields = _.get(bodyParams,'exist_fields',[]);
    if (_.isArray(exist_fields) && exist_fields.length){
        //如果是查询重复线索，要按repeat_id排序
        if (_.indexOf(exist_fields,'repeat_id') > -1){
            url = url.replace(':sort_field', 'repeat_id');
        }else {
            url = url.replace(':sort_field',req.params.sort_field);
        }
    }else {
        url = url.replace(':sort_field',req.params.sort_field);
    }
    return {url: url, bodyObj: bodyParams};
}

// 获取线索池列表
exports.getCluePoolList = (req, res) => {
    const obj = handleCluePram(req, restApis.getCluePoolList);
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
            url: restApis.cluePoolFilterURL.replace(':field','province'),
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


// 根据线索的id获取线索的详情
exports.getClueDetailById = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.getClueDetailById.replace(':lead_pool_id', req.params.clueId),
            req: req,
            res: res
        }, null);
};