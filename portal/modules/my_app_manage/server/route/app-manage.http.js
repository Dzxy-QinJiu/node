/**
 * Created by wangliping on 2016/3/4.
 * * 请求路径 - app
 */
require("../action/app-manage-controller");

module.exports = {
    module: "my_app_manage/server/action/app-manage-controller",
    routes: [{
        "method": "get",
        "path": "/rest/my_app_list",
        "handler": "getMyAppList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP"//我的应用列表
        ]
    }, {
        "method": "get",
        "path": "/rest/my_app/:app_id",
        "handler": "getCurAppById",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            //"APP_MANAGE_LIST_APPS"
            //有一个需求：获取一个app_id对应的logo
            //如果限制了权限，产品总经理看在线用户统计的时候，将不能显示应用logo
        ]
    }, {
        "method": "put",
        "path": "/rest/my_app",
        "handler": "editApp",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_EDIT"
        ]
    }, {
        "method": "put",
        "path": "/rest/my_app/refresh_secret/:app_id",
        "handler": "refreshAppSecret",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "REFRESH_SECRET"
        ]
    }, {
        "method": "put",
        "path": "/rest/my_app/expire_date",
        "handler": "updateExpireDate",
        "passport": {
            "needLogin": true
        }
    }, {
        // 导出权限模板文件
        "method": "get",
        "path": "/rest/my_app/auth/download_template",
        "handler": "exportAuthModuleFilename",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_AUTHORITY_ADD"
        ]
    }, {
        //  导出权限
        "method": "get",
        "path": "/rest/my_app/export_authority/:client_id",
        "handler": "exportAuthorityList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_AUTHORITY_ADD"
        ]
    }, {
        // 导入权限
        "method": "post",
        "path": "/rest/my_app/import_authority/:client_id",
        "handler": "uploadAuthority",
        "passport": {
            "needLogin": true
        }, "privileges": [
            "USER_INFO_MYAPP_EDIT"
        ]
    }, {
        // 导出角色模板文件
        "method": "get",
        "path": "/rest/my_app/role/download_template",
        "handler": "exportRoleModuleFilename",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_ROLE_ADD"
        ]
    }, {
        // 导出角色
        "method": "get",
        "path": "/rest/my_app/export_role/:client_id",
        "handler": "exportRoleList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_ROLE_ADD"
        ]
    }, {
        // 导入角色
        "method": "post",
        "path": "/rest/my_app/import_role/:client_id",
        "handler": "uploadRole",
        "passport": {
            "needLogin": true
        }, "privileges": [
            "USER_INFO_MYAPP_EDIT"
        ]
    }]
};