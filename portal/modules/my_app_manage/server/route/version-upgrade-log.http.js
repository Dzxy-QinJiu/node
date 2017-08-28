/**
 * * 请求路径
 */
require("../action/version-upgrade-log-controller");

module.exports = {
    module: "my_app_manage/server/action/version-upgrade-log-controller",
    routes: [{
        "method": "get",
        "path": "/rest/get_app/version/records",
        "handler": "getAppRecordsList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "GET_APPLICATION_RECORD"  //查看应用版本升级记录信息
        ]
    },{
        // 添加应用版本升级记录的版本号和升级内容
        "method": "post",
        "path": "/rest/add_app/version/record",
        "handler": "addAppVersion",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ADD_APPLICATION_RECORD"    
        ]
    }, {
        // 添加版本升级记录
        "method": "post",
        "path": "/rest/my_app/upload/version_upgrade",
        "handler": "uploadVersionUpgrade",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ADD_APPLICATION_RECORD"
        ]
    },{
        // 下载版本记录对应的文件
        "method": "get",
        "path": "/rest/app/record/download_file/:record_id",
        "handler": "getAppRecordFile",
        "passport": {
            "needLogin": true
        }
    },{
        // 删除版本记录
        "method": "delete",
        "path": "/rest/delete_app/version/record/:record_id",
        "handler": "deleteAppVersionRecord",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "DELETE_APPLICATION_RECORD"
        ]
    }]
};