var SalesmanService = require('../service/salesman');
var Resolver = require('fastjson_ref_resolver').Resolver;
const _ = require('lodash');

//获取销售人员列表
exports.getSalesmanList = function(req, res) {
    SalesmanService.getSalesmanList(req, res).on('success', function(data) {
        // 后端fastjson升级1.2.53后，ref会出现group\\_id的情况, Resolve无法解析
        // data = new Resolver(data).resolve();
        // 因此，后端解析成字符串后传回来的，此处需要parse后转成列表
        data = _.isString(data) ? JSON.parse(data) : data;
        res.status(200).json(data || []);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getMyTeamTreeMemberList = function(req, res) {
    SalesmanService.getMyTeamTreeMemberList(req, res).on('success', function(data) {
        res.status(200).json(data || []);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
