/**
 * Copyright (c) 2019-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2019-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/23.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const restApis = {
    //获取推荐的线索
    getRecommendClueLists: '/rest/clue/v2/companys/search/drop_down_load',
    //获取行业配置
    getClueIndustryLists: '/rest/company/v1/ent/industrys',
    //获取个人配置
    selfConditionConfig: '/rest/clue/v2/ent/search',
    //提取某条线索
    extractRecommendClue: '/rest/clue/v2/ent/clue',
    //批量提取线索
    batchExtractRecommendLists: '/rest/clue/v2/ent/clues',
    //获取线索最大提取量的数值（适用用户是今天的最大提取量，正式用户是本月的最大提取量）及已经提取了多少的数值
    getMaxLimitCountAndHasExtractedClue: 'rest/clue/v2/month/able/clues',
    //根据企业名称模糊获取企业基本信息
    getCompanyListByName: '/rest/company/v1/companys/name',
    //查看组织内企业信息是否被提取过
    getRecommendCluePicked: '/rest/clue/v2/ent/clues/picked',
};

//获取线索最大提取量及已经提取了多少
exports.getMaxLimitCountAndHasExtractedClue = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getMaxLimitCountAndHasExtractedClue,
            req: req,
            res: res
        }, null);
};
//提取单条线索
exports.extractRecommendClue = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.extractRecommendClue,
            req: req,
            res: res
        }, req.body);
};
//批量提取线索
exports.batchExtractRecommendLists = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.batchExtractRecommendLists,
            req: req,
            res: res
        }, req.body);
};
//获取行业配置
exports.getClueIndustryLists = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getClueIndustryLists + '?load_size=1000',
            req: req,
            res: res
        }, null);
};
//获取个人查询配置
exports.getSelfClueConditionConfig = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.selfConditionConfig,
            req: req,
            res: res
        }, null);
};
//添加和修改个人查询配置
exports.addOrEditSelfClueConditionConfig = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.selfConditionConfig,
            req: req,
            res: res
        }, req.body);
};
//获取推荐线索
exports.getRecommendClueLists = function(req, res) {
    let data = JSON.parse(req.body.reqData);
    return restUtil.authRest.post(
        {
            url: restApis.getRecommendClueLists + '?load_size=' + req.query.load_size,
            req: req,
            res: res
        }, data);
};
exports.getCompanyListByName = function(req, res) {
    return restUtil.authRest.get({
        url: restApis.getCompanyListByName,
        req: req,
        res: res
    }, req.query);
};
exports.getRecommendCluePicked = function(req, res) {
    return restUtil.authRest.get({
        url: restApis.getRecommendCluePicked,
        req: req,
        res: res
    }, req.query);
};