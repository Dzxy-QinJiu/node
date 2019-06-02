/**
 * Created by wangliping on 2018/1/8.
 */
const competingProductService = require('../service/competing-product-service');
// 获取竞品
exports.getCompetingProduct = function(req, res) {
    competingProductService.getCompetingProduct(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 添加竞品
exports.addCompetingProduct = function(req,res) {
    competingProductService.addCompetingProduct(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 删除竞品
exports.deleteCompetingProduct = function(req,res) {
    let product = req.params.product;
    competingProductService.deleteCompetingProduct(req, res, product).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
