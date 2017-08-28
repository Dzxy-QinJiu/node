var UserOnlineAnalysisService = require("../service/user-online-analysis-service");

//获取用户在线统计基本信息
exports.getOnlineAnalysisSummary = function(req,res){
    var page_size = req.params.page_size;
    var page = req.params.page;
    UserOnlineAnalysisService.getOnlineAnalysisSummary(req,res,page,page_size).on("success", function (data) {
        res.json(data);
    }).on("error", function (ret) {
        res.status(500).json(ret);
    })
};

//获取某个应用的在线用户浏览器信息
exports.getOnlineBrowserByApp = function(req,res) {
    var app_id = req.params.app_id;
    UserOnlineAnalysisService.getBrowserAnalysis(req,res,app_id).on("success", function (data) {
        res.json(data);
    }).on("error", function (ret) {
        res.status(500).json(ret);
    });
};



//获取某个应用的地域信息
exports.getOnlineZoneByApp = function(req,res) {
    var app_id = req.params.app_id;
    UserOnlineAnalysisService.getZoneAnalysis(req,res,app_id).on("success", function (data) {
        res.json(data);
    }).on("error", function (ret) {
        res.status(500).json(ret);
    });
};