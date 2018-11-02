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