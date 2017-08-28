var SalesmanService = require("../service/salesman");
var Resolver = require("fastjson_ref_resolver").Resolver;

//获取销售人员列表
exports.getSalesmanList = function(req, res) {
    SalesmanService.getSalesmanList(req, res).on("success", function(data) {
        data = new Resolver(data).resolve();
        res.json(data);
    }).on("error", function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
