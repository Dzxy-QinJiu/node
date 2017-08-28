//service文件
var OplateCustomerAnalysisService = require("../service/oplate-customer-analysis.service");

//获取 统计总数
exports.getSummaryNumbers = function(req,res) {
    OplateCustomerAnalysisService.getSummaryNumbers(req,res,req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取具体统计数据
exports.getAnalysisData = function(req,res) {
    OplateCustomerAnalysisService.getAnalysisData(req,res,req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取当前登录用户在团队树中的位置
exports.getGroupPosition = function(req,res) {
    OplateCustomerAnalysisService.getGroupPosition(req,res).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

