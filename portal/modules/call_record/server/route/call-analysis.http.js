/**
 * * 请求路径 - app
 */
require("../action/call-analysis-controller");

module.exports = {
    module: "call_record/server/action/call-analysis-controller",
    routes: [
        { // 获取单次通话时长为top10的数据
            "method": "post",
            "path": "/rest/call/duration/top/ten/:start_time/:end_time/:page_size/:sort_field/:sort_order",
            "handler": "getCallDurTopTen",
            "passport": {
                "needLogin": true
            }
        }, { // 获取通话数量和通话时长趋势图统计
            "method": "post",
            "path": "/rest/call/duration/count/:start_time/:end_time",
            "handler": "getCallCountAndDur",
            "passport": {
                "needLogin": true
            }
        }, { // 获取电话的接通情况
            "method": "post",
            "path": "/rest/call/info/:type",
            "handler": "getCallInfo",
            "passport": {
                "needLogin": true
            },
            "privileges": []
        }, { // 获取通话记录中，114占比统计
            "method": "post",
            "path": "/rest/call/rate/:start_time/:end_time",
            "handler": "getCallRate",
            "passport": {
                "needLogin": true
            }
        }, { // 获取团队信息
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
        }
    ]
};