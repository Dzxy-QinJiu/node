/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";

/**
 * 请求路径 - login
 */

module.exports = {
    module: "rolePrivilege_role/server/action/role-manage-controller",
    routes: [{
        "method": "get",
        "path": "/rest/role_list/:client_id",
        "handler": "getRoleList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ROLEP_RIVILEGE_ROLE_LIST"//查看角色
        ]
    },  {
        "method": "post",
        "path": "/rest/role",
        "handler": "addRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ROLEP_RIVILEGE_ROLE_ADD"//添加角色
        ]
    }, {
        "method": "put",
        "path": "/rest/role",
        "handler": "editRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ROLEP_RIVILEGE_ROLE_EDIT"//修改角色
        ]
    }, {
        "method": "delete",
        "path": "/rest/role/:id",
        "handler": "deleteRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ROLEP_RIVILEGE_ROLE_DELETE"//删除角色
        ]
    }, {
        "method": "get",
        "path": "/rest/my_app/role_list/:client_id",
        "handler": "getRoleList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_ROLE_LIST"//查看我的应用中的角色
        ]
    }, {
        "method": "post",
        "path": "/rest/my_app/role",
        "handler": "addRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_ROLE_ADD"//添加我的应用中的角色
        ]
    }, {
        "method": "put",
        "path": "/rest/my_app/role",
        "handler": "editRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_ROLE_EDIT"//修改我的应用中的角色
        ]
    }, {
        "method": "delete",
        "path": "/rest/my_app/role/:id",
        "handler": "deleteRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_ROLE_DELETE"//删除我的应用中的角色
        ]
    },
    {
        "method": "post",
        "path": "/rest/baserole/config",
        "handler": "setDefaultRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
           "APPLICATION_BASE_ROLE_MANAGEMENT"//设置默认角色
        ]
    },
    {
        "method": "delete",
        "path": "/rest/baserole/config",
        "handler": "delDefaultRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
           "APPLICATION_BASE_ROLE_MANAGEMENT"//删除默认角色
        ]
    },
    {
        "method": "get",
        "path": "/rest/baserole/config",
        "handler": "getDefaultRole",
        "passport": {
            "needLogin": true
        },
        "privileges": [
           "APPLICATION_BASE_ROLE_MANAGEMENT"//获取默认角色
        ]
    }
    ]
};