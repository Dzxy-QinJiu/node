/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
//var JSX = require('node-jsx').install({ extension: '.jsx' });
require('babel/register');
var path = require("path");
var React = require("react");
var ReactDOMServer = require('react-dom/server');
var LoginForm = React.createFactory(require('../../../components/Login'));
var DesktopLoginService = require("../service/desktop-login-service");
var UserDto = require("../../../lib/utils/user-dto");


/*
 * login page handler.
 */
exports.showLoginPage = function (req, res) {
    var loginErrorMsg = req.session.loginErrorMsg;
    delete req.session.loginErrorMsg;
    var formHtml = ReactDOMServer.renderToString(LoginForm({}));
    res.render('login/tpl/desktop-login', {loginForm: formHtml, loginErrorMsg: loginErrorMsg});
};
/*
 * 登录逻辑
 */
exports.login = function (req, res) {

    var user = {
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
            "NOTIFICATION_CUSTOMER_LIST",
            "NOTIFICATION_APPLYFOR_LIST",
            "NOTIFICATION_SYSTEM_LIST",
            "OPLATE_ONLINE_USER_ANALYSIS",
            "OPLATE_ONLINE_USER_LIST"
        ]
    };

    delete user.user_logo;
    var userData = UserDto.toSessionData(user);
    req.session.user = userData.user;
    req.session["_USER_TOKEN_"] = userData["_USER_TOKEN_"];
    req.session.save(function (err) {
        res.redirect("/");
    });

};