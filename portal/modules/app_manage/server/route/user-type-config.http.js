/**
 * Created by zhshj on 2017/2/14.
 */
/**
 * * 请求路径
 */
require("../action/user-type-config");

module.exports = {
    module: "app_manage/server/action/user-type-config",
    routes: [{
        //获取用户类型配置
        "method": "get",
        "path": "/rest/usertypeconfig",
        "handler": "getUserTypeConfig",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "GET_APP_EXTRA_GRANTS"
        ]
    }, {
        // 添加用户类型设置
        "method": "post",
        "path": "/rest/add_usertypeconfig",
        "handler": "addUserTypeConfig",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "CREATE_APP_EXTRA_GRANT"
        ]
    },{
        // 修改用户类型设置
        "method": "put",
        "path": "/rest/update_usertypeconfig",
        "handler": "updateUserTypeConfig",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "UPDATE_APP_EXTRA_GRANT"
        ]
    }
    ]
};