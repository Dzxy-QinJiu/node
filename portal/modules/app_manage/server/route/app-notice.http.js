/**
 * * 请求路径
 */
require("../action/app-notice-controller");

module.exports = {
    module: "app_manage/server/action/app-notice-controller",
    routes: [{
        "method": "get",
        "path": "/rest/get_app/notice",
        "handler": "getAppNoticeList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "GET_APPLICATION_NOTICE" //查看应用系统公告
        ]
    }]
};