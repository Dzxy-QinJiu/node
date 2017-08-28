/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";

/**
 * 请求路径 - login
 */
module.exports = {
    module: "rolePrivilege_authority/server/action/authority-manage-controller",
    routes: [{
        "method": "get",
        "path": "/rest/authority/:client_id",
        "handler": "getAuthorityList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            //"ROLEP_RIVILEGE_AUTHORITY_LIST"//查看权限
            //没办法，创建用户的时候，要指定权限和角色，需要获取权限组，管理员可能没有这个权限
        ]
    }, {
        "method": "put",
        "path": "/rest/authority_group_name",
        "handler": "editAuthorityGroupName",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ROLEP_RIVILEGE_AUTHORITY_EDIT"//修改权限
        ]
    }, {
        "method": "post",
        "path": "/rest/authority",
        "handler": "addAuthority",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ROLEP_RIVILEGE_AUTHORITY_ADD"//添加权限
        ]
    }, {
        "method": "put",
        "path": "/rest/authority",
        "handler": "editAuthority",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ROLEP_RIVILEGE_AUTHORITY_EDIT"//修改权限
        ]
    }, {
        "method": "post",
        "path": "/rest/authority/del",
        "handler": "deleteAuthority",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "ROLEP_RIVILEGE_AUTHORITY_DELETE"//删除权限
        ]
    }, {
        "method": "get",
        "path": "/rest/my_app/authority/:client_id",
        "handler": "getAuthorityList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_AUTHORITY_LIST"//查看我的应用中的权限
        ]
    }, {
        "method": "put",
        "path": "/rest/my_app/authority_group_name",
        "handler": "editAuthorityGroupName",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_AUTHORITY_EDIT"//修改我的应用中的权限
        ]
    }, {
        "method": "post",
        "path": "/rest/my_app/authority",
        "handler": "addAuthority",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_AUTHORITY_ADD"//添加我的应用中的权限
        ]
    }, {
        "method": "put",
        "path": "/rest/my_app/authority",
        "handler": "editAuthority",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_AUTHORITY_EDIT"//修改我的应用中的权限
        ]
    }, {
        "method": "post",
        "path": "/rest/my_app/authority/del",
        "handler": "deleteAuthority",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_INFO_MYAPP_AUTHORITY_DELETE"//删除我的应用中的权限
        ]
    }]
};