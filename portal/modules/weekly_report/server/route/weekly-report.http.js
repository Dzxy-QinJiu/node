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
        },{ // 添加员工请假信息
            "method": "post",
            "path": "/rest/weekly_report/add/askForLeave",
            "handler": "addAskForLeave",
            "passport": {
                "needLogin": true
            },
            "privileges": ["CALLRECORD_ASKFORLEAVE_ADD"]
        },{ // 更新员工请假信息
            "method": "put",
            "path": "/rest/weekly_report/update/askForLeave",
            "handler": "updateAskForLeave",
            "passport": {
                "needLogin": true
            },
            "privileges": ["CALLRECORD_ASKFORLEAVE_UPDATE"]
        },{ // 删除员工请假信息
            "method": "delete",
            "path": "/rest/weekly_report/delete/askForLeave/:id",
            "handler": "deleteAskForLeave",
            "passport": {
                "needLogin": true
            },
            "privileges": ["CALLRECORD_ASKFORLEAVE_DELETE"]
        }
    ]
};