var CustomerService = require('../service/customer');
//获取客户suggest数据
exports.getCustomerSuggest = function(req , res) {
    var q = req.query.q;
    var fields = req.header('fields');
    CustomerService.getCustomerSuggest(req,res,q,fields).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '获取客户失败');
    });
};
//获取客户的用列表
exports.getCrmUserList = function(req, res) {
    CustomerService.getCrmUserList(req, res, req.query)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};