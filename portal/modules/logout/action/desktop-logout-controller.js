/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';
var DesktopLogoutService = require('../service/desktop-logout-service');
var config = require('../../../../conf/config');
var logoutMsgEmitter = require('../../../../portal/lib/utils/server-emitters').logoutMsgEmitter;
/*
 * logout page handler.
 */
exports.logout = function(req, res) {
    //退出的时候需要发送事件，通知给chrome extend插件
    logoutMsgEmitter.emit(logoutMsgEmitter.LOGOUT_ACCOUNT,{
        sessionId: req.sessionID,
        user: req.session.user
    });
    //语言环境
    var lang = req.session.lang;
    var langParam = lang ? ('lang=' + lang) : '';//语言参数
    var loginUrl = '/login' + (langParam ? ('?' + langParam) : '');//登录界面路径
    if (config.useSso) {
        //如果使用sso登录的，调用ssoLogout
        DesktopLogoutService.ssoLogout(req, res).on('success', function() {
            req.session.destroy(function() {
                //加stopcheck参数，防止再次sso校验登录
                res.redirect('/login?stopcheck=true' + (langParam ? ('&' + langParam) : ''));
            });
        }).on('error', function() {
            //阻止sso的check
            req.session.stopcheck = 'true';
            //删除session的user，但不清除session,为了传递stopcheck，并需要重新登录
            req.session.user = '';
            req.session.save(function() {
                res.redirect(loginUrl);
            });
        });
    }else {
        //普通的登录,调用logout
        DesktopLogoutService.logout(req, res);
        req.session.destroy(function() {
            if(!req.query.isWechatLogout){//如果不是在小程序的web-view界面中退出的时候，才跳转到登录页
                res.redirect(loginUrl);
            }
        });
    }
};
