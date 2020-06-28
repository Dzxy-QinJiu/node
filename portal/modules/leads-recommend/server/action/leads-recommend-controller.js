/**
 * Copyright (c) 2019-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2019-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/23.
 */
'use strict';
var leadsRecommendService = require('../service/leads-recommend-service');
const _ = require('lodash');
const recommendClueDto = require('../dto/recommend-clue');

//获取线索最大提取量及已经提取的线索量
exports.getMaxLimitCountAndHasExtractedClue = function(req, res) {
    leadsRecommendService.getMaxLimitCountAndHasExtractedClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取推荐线索列表
exports.getRecommendClueLists = function(req, res) {
    leadsRecommendService.getRecommendClueLists(req, res)
        .on('success', function(data) {
            var result = {list: [],total: _.get(data,'total',0), listId: _.get(data,'id','')};
            _.forEach(_.get(data,'list',[]), item => {
                result.list.push(recommendClueDto.toFrontRecommendClueData(item));
            });
            res.status(200).json(result);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取行业列表
exports.getClueIndustryLists = function(req, res) {
    leadsRecommendService.getClueIndustryLists(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取个人设置的推荐线索条件
exports.getSelfClueConditionConfig = function(req, res) {
    leadsRecommendService.getSelfClueConditionConfig(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//修改个人推荐线索条件配置
exports.addOrEditSelfClueConditionConfig = function(req, res) {
    leadsRecommendService.addOrEditSelfClueConditionConfig(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//单个提取
exports.extractRecommendClue = function(req, res) {
    leadsRecommendService.extractRecommendClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//批量提取
exports.batchExtractRecommendLists = function(req, res) {
    leadsRecommendService.batchExtractRecommendLists(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取联想列表数据
exports.getCompanyListByName = function(req, res) {
    leadsRecommendService.getCompanyListByName(req, res)
        .on('success',function(data) {
            res.status(200).json(data);
        }).on('error',function(err) {
            res.status(500).json(err.message);
        });
};

//获取该线索是否被提取
exports.getRecommendCluePicked = function(req, res) {
    leadsRecommendService.getRecommendCluePicked(req, res)
        .on('success',function(data) {
            res.status(200).json(data);
        }).on('error',function(err) {
            res.status(500).json(err.message);
        });
};

