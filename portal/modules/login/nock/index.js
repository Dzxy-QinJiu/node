var path = require("path");
var restLogger = require("../../../lib/utils/logger").getLogger('nock');
var RestUtil = require("ant-auth-request").restUtil(restLogger)(restLogger);
var nock = require("nock");
var nockParser = require(path.resolve(portal_root_path, "./lib/utils/nockParser"));

var LoginService = require("../service/desktop-login-service");

exports.init = function () {
    nock(config.nockUrl)
        .persist()
        .get(LoginService.urls.logincheck)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, false , {}
                ]);
            } , 100);
        });
    //获取登录信息
    nock(config.nockUrl)
        .persist()
        .post(LoginService.urls.login)
        .query(true)
        .reply(function (uri, requestBody) {
            return {
                //登录用户基本信息
                "user_id": "xxxxx9xX4mRbXW0BZcFFfZv",
                "user_name": "哈哈",
                "nick_name": "哈哈哈",
                "user_logo": "http://img3.tbcdn.cn/tfscom/TB1jh_xIVXXXXcMXFXXSutbFXXX.jpg",
                "auth": {
                    //登录用户token
                    "token": "2EIa6n0or5egaT405Po5EoHJ",
                    "client_id": "EoHJ2EIa6n0oPo5rIa6n5T405ega",
                    "realm_id": "n0or2gaT4Po5E5e06oHJ5EIa"
                },
                //登录用户权限
                "privileges": [
                    "REALM_MANAGE_ADD_REALM",
                    "REALM_MANAGE_EDIT_REALM",
                    "REALM_MANAGE_LIST_REALMS",
                    "REALM_MANAGE_USE",
                    "CRM_LIST_CUSTOMERS",
                    "CRM_CUSTOMER_INFO",
                    "CRM_CUSTOMER_INFO_EDIT",
                    "CRM_LIST_CONTACTS",
                    "CRM_DELETE_CONTACT",
                    "CRM_SET_DEFAULT_CONTACT",
                    "CRM_ADD_CONTACT",
                    "CRM_EDIT_CONTACT",
                    "USER_INFO_USER",
                    "USER_INFO_PWD",
                    "USER_INFO_MYAPP",
                    "APP_MANAGE_ADD_APP",
                    "APP_MANAGE_EDIT_APP",
                    "APP_MANAGE_LIST_APPS",
                    "APP_MANAGE_USE",
                    "APP_MANAGE_LIST_LOG",
                    "APP_USER_LIST",
                    "APP_USER_ADD",
                    "APP_USER_EDIT",
                    "APP_USER_APPLY_LIST",
                    "APP_USER_APPLY_APPROVAL",
                    "USER_BATCH_OPERATE",
                    "OPLATE_BD_ANALYSIS_REALM_ZONE",
                    "OPLATE_BD_ANALYSIS_REALM_INDUSTRY",
                    "OPLATE_BD_ANALYSIS_REALM_ESTABLISH",
                    "OPLATE_USER_ANALYSIS_SUMMARY",
                    "OPLATE_USER_ANALYSIS_ZONE",
                    "OPLATE_USER_ANALYSIS_INDUSTRY",
                    "OPLATE_USER_ANALYSIS_ACTIVE",
                    "USER_MANAGE_ADD_USER",
                    "USER_MANAGE_EDIT_USER",
                    "USER_MANAGE_DELETE_USER",
                    "USER_MANAGE_LIST_USERS",
                    "USER_MANAGE_LIST_LOG",
                    "ROLEP_RIVILEGE_ROLE_ADD",
                    "ROLEP_RIVILEGE_ROLE_DELETE",
                    "ROLEP_RIVILEGE_ROLE_EDIT",
                    "ROLEP_RIVILEGE_ROLE_LIST",
                    "ROLEP_RIVILEGE_AUTHORITY_ADD",
                    "ROLEP_RIVILEGE_AUTHORITY_DELETE",
                    "ROLEP_RIVILEGE_AUTHORITY_EDIT",
                    "ROLEP_RIVILEGE_AUTHORITY_LIST",
                    "BGM_SALES_STAGE_LIST",//查看销售阶段
                    "BGM_SALES_STAGE_DELETE",//删除销售阶段
                    "BGM_SALES_STAGE__EDIT",//修改销售阶段
                    "BGM_SALES_STAGE_ADD",//添加销售阶段
                    "BGM_SALES_STAGE_SORT",//销售阶段排序
                    "BGM_SALES_TEAM_LIST",//查看销售团队列表
                    "BGM_SALES_TEAM_MEMBER_ADD",//销售团队添加成员
                    "BGM_SALES_TEAM_MEMBER_DELETE",//销售团队删除成员
                    "BGM_SALES_TEAM_ADD",//销售团队添加
                    "BGM_SALES_TEAM_DELETE",//销售团队删除
                    "BGM_SALES_TEAM_EDIT",//销售团队修改
                    "NOTIFICATION_CUSTOMER_LIST",//查看通知-客户提醒
                    "NOTIFICATION_APPLYFOR_LIST",//查看通知-申请消息
                    "NOTIFICATION_SYSTEM_LIST",   //查看通知-系统公告
                    "OPLATE_ONLINE_USER_ANALYSIS",//在线用户-用户统计
                    "OPLATE_ONLINE_USER_LIST"//在线用户-用户列表
                ]
            };
        });
};