/*

 获取行业

 */
var IndustryManageService = require("../service/industry_manage.service");
// 获取行业配置
exports.getIndustries = function(req, res) {
    IndustryManageService.getIndustries(req, res, req.query).on("success", function(data) {
        res.json(data);
    }).on("error", function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 添加行业配置
exports.addIndustries = function(req,res) {
    IndustryManageService.addIndustries(req, res, req.body).on("success", function(data) {
        res.json(data);
    }).on("error", function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 删除行业配置
exports.deleteIndustries = function(req,res) {
    var delete_id = req.params.delete_id;
    IndustryManageService.deleteIndustries(req, res, delete_id).on("success", function(data) {
        res.json(data);
    }).on("error", function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

