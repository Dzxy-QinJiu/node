module.exports = {
    module: "app_user_manage/server/action/user_audit_log_controller",
    routes: [{
        "method": "get",
        "path": "/rest/user/log",
        "handler": "getUserLogList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_AUDIT_LOG_LIST"
        ]
    },{
        "method": "get",
        "path": "/rest/log/app/user_detail/:user_id",
        "handler": "getSingleAuditLogList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_AUDIT_LOG_LIST"
        ]
    },{   // 获取用户登录相关的信息
        "method": "get",
        "path": "/rest/user/login/info/:user_id",
        "handler": "getUserLoginInfo",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_AUDIT_LOG_LIST"
        ]
    }
    ]
};