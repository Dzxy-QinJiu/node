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
    var type = req.query.type;
    var errorMsg = '';
    switch (type) {
    case 'user':
        errorMsg = '变更销售人员失败';
        break;
    case 'label':
        errorMsg = '变更标签失败';
        break;
    case 'industry':
        errorMsg = '变更行业失败';
        break;
    case 'address':
        errorMsg = '变更地域失败';
        break;
    }
    batchChangeService.doBatch(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message || errorMsg);
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