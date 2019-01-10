var dealManageService = require('../service/deal-manage-service');

exports.getDealList = function(req, res) {
    dealManageService.getDealList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.addDeal = function(req, res) {
    dealManageService.addDeal(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.editDeal = function(req, res) {
    dealManageService.editDeal(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.deleteDeal = function(req, res) {
    dealManageService.deleteDeal(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//各阶段总预算的获取
exports.getStageTotalBudget = function(req, res) {
    dealManageService.getStageTotalBudget(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
