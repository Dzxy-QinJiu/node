var batchChangeService = require('../service/batch-change-service');

exports.getGroupList = function(req, res) {
    batchChangeService.getGroupList(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.json(err.message);
        });
};

//客户批量操作
exports.doBatch = function(req, res) {
    batchChangeService.doBatch(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

exports.getRecommendTags = function(req, res) {
    batchChangeService.getRecommendTags(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.json(err.message);
        });
};

//获取行业列表
exports.getIndustries = function(req,res) {
    batchChangeService.getIndustries(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};