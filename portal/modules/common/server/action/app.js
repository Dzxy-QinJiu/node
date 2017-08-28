var appService = require("../service/app");
//根据当前用户数据权限，获取应用列表
exports.getGrantApplications = function(req , res) {
    //获取应用状态
    var status = req.query.status;
    if(!status) {
        status = "true";
    }
    appService.getGrantApplications(req,res,status).on("success" , function(data) {
        res.json(data);
    }).on("error" , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || "获取应用列表失败");
    });
};
//根据当前用户数据权限，获取“我的应用”列表
exports.getMyApplications = function(req , res) {
    appService.getMyApplications(req,res).on("success" , function(data) {
        res.json(data);
    }).on("error" , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || "获取我的应用列表失败");
    });
};