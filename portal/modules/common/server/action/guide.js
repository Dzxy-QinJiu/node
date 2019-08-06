var guideService = require('../service/guide');
var _ = require('lodash');

//获取我的引导
exports.getGuideConfig = function(req, res) {
    guideService.getGuideConfig(req, res).on('success' , function(data) {
        res.status(200).json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//引导步骤标注
exports.setGuideMark = function(req , res) {
    guideService.setGuideMark(req,res).on('success' , function(data) {
        if(_.isNil(data)) {
            res.status(200).json('success');
        }else{
            res.status(200).json(data);
        }
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//关闭引导标注
exports.closeGuideMark = function(req , res) {
    guideService.closeGuideMark(req,res).on('success' , function(data) {
        if(_.isNil(data)) {
            res.status(200).json('success');
        }else{
            res.status(200).json(data);
        }
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getRecommendClueLists = function(req, res) {
    guideService.getRecommendClueLists(req, res).on('success', function(data) {
        var lists = [];
        _.forEach(data, item => {
            lists.push({
                id: item.id,
                name: item.name, // 名称
                industry: item.industry || '', // 所属行业
                entType: item.entType || '', //企业性质
                province: item.province || '',// 省份
                staffnumMin: item.staffnumMin || '', //人员规模最小数
                staffnumMax: item.staffnumMax || '', //人员规模最大数
                capital: item.capital || '', //资金规模
            });
        });
        res.status(200).json(lists);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.batchExtractRecommendLists = function(req, res) {
    guideService.batchExtractRecommendLists(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};