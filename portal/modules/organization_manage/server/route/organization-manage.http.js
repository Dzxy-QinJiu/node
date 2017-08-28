/**
 * Created by wangliping on 2016/10/18.
 */
"use strict";

/**
 * 请求路径 - login
 */

module.exports = {
    module: "organization_manage/server/action/organization-manage-controller",
    routes: [{
        "method": "get",
        "path": "/rest/organization_list",
        "handler": "getOrganizationList",
        "passport": {
            "needLogin": true
        }, "privileges": [
            "USER_ORGANIZATION_LIST"//查看用户的组织列表
        ]
    }, {
        "method": "get",
        "path": "/rest/organization_member_list/:group_id",
        "handler": "getOrganizeMembersById",
        "passport": {
            "needLogin": true
        }, "privileges": [
            "USER_ORGANIZATION_MEMBER_LIST"//查看组织的成员列表
        ]
    }, {
        "method": "get",
        "path": "/rest/organization_member_list",
        "handler": "getMemberList",
        "passport": {
            "needLogin": true
        }, "privileges": [
            "APP_USER_LIST"//查看用户列表
        ]
    }, {
        "method": "post",
        "path": "/rest/organization_member",
        "handler": "addOrganizeMember",
        "passport": {
            "needLogin": true
        }, "privileges": [
            "USER_ORGANIZATION_MEMBER_ADD"//组织成员的添加
        ]
    }, {
        "method": "put",
        "path": "/rest/organization_member",
        "handler": "editOrganizationMember",
        "passport": {
            "needLogin": true
        }, "privileges": [
            "USER_ORGANIZATION_MEMBER_EDIT"//组织成员的编辑
        ]
    }, {
        "method": "delete",
        "path": "/rest/organization/:group_id",
        "handler": "deleteOrganization",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_ORGANIZATION_DELETE"//删除组织
        ]
    }, {
        "method": "post",
        "path": "/rest/organization",
        "handler": "addOrganization",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_ORGANIZATION_ADD"//添加组织
        ]
    }, {
        "method": "put",
        "path": "/rest/organization",
        "handler": "editOrganization",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_ORGANIZATION_EDIT"//编辑组织
        ]
    }]
};
