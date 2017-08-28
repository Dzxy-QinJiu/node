/**
 * Created by wangliping on 2017/4/13.
 */
var TeamService = require("../service/team");

//根据团队id获取团队下的成员列表
exports.getSalesTeamMemberList = function (req, res) {
    var groupId = req.params.group_id;
    TeamService.getSalesTeamMemberList(req, res, groupId, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取当前销售所在销售团队及其子团队列表
exports.getSalesTeamList = function (req, res) {
    TeamService.getSalesTeamList(req, res).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};