/**
 * * 请求路径
 */
require("../action/version-upgrade-log-controller");

module.exports = {
    module: "app_manage/server/action/version-upgrade-log-controller",
    routes: [{
        "method": "get",
        "path": "/rest/get_app/version/records",
        "handler": "getAppRecordsList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "GET_APPLICATION_RECORD"  //查看应用版本升级记录
        ]
    }]
};