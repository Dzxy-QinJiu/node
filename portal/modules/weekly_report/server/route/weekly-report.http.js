/**
 * * 请求路径 - app
 */
require("../action/weekly-report-controller");

module.exports = {
    module: "weekly_report/server/action/weekly-report-controller",
    routes: [
       { // 获取团队信息
            "method": "get",
            "path": "/rest/get/sale/teams/:type",
            "handler": "getSaleGroupTeams",
            "passport": {
                "needLogin": true
            }
        }, { // 获取成员信息
            "method": "get",
            "path": "/rest/get/sale/member/:type",
            "handler": "getSaleMemberList",
            "passport": {
                "needLogin": true
            }
        }, { // 获取电话的接通情况
            "method": "post",
            "path": "/rest/weekly_report/call/info/:type",
            "handler": "getCallInfo",
            "passport": {
                "needLogin": true
            },
            "privileges": []
        }
    ]
};