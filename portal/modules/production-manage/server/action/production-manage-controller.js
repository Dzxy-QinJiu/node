var productionManageService = require('../service/production-manage-service');
exports.foo = function(req, res) {
    productionManageService.foo(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};