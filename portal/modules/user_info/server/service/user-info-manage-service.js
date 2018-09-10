/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by 肖金峰 on 2016/2/3.
 */

'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var auth = require('../../../../lib/utils/auth');

var userInfoRestApis = {
    getUserInfo: '/rest/base/v1/user/id',
    getLogList: '/rest/analysis/auditlog/v1/login/:user_name/drop_down_load',
    editUserInfo: '/rest/base/v1/user/baseinfo',
    setUserLanguage: '/rest/base/v1/user/member/language/setting',
    checkUserInfoPwd: '/rest/base/checkUserInfoPwd',
    editUserInfoPwd: '/rest/base/v1/user',
    activeUserEmail: '/rest/base/v1/user/bunding/email',//邮箱激活接口
    getManagedRealm: '/rest/base/v1/realm/managedrealm',//所管理的安全域
    getOrganization: '/rest/base/v1/user/organization',//获取当前登录用户所在的组织
    setSubscribeEmail: '/rest/base/v1/user/email/rejection'//是否订阅通知邮件

};

exports.urls = userInfoRestApis;

exports.getUserInfo = function(req, res, userId) {
    return restUtil.authRest.get(
        {
            url: userInfoRestApis.getUserInfo + '/' + userId,
            req: req,
            res: res
        }, {}, {
            success: function(eventEmitter, data) {
                //处理数据
                if (data) {
                    var roles = data.roles;
                    var rolesName = '';
                    if (roles) {
                        rolesName = _.map(roles, 'role_name').join(',');
                    }
                    data = {
                        id: data.user_id,
                        userName: data.user_name || '',
                        nickName: data.nick_name || '',
                        userLogo: data.user_logo || '',
                        password: data.password || '密码******',
                        repassWord: data.passWord || '密码******',
                        phone: data.phone || '',
                        email: data.email || '',
                        emailEnable: data.email_enable,
                        rolesName: rolesName,
                        status: data.status,
                        reject: data.reject
                    };
                }
                eventEmitter.emit('success', data);
            }
        });
};

exports.getLogList = function(req, res) {
    let userName = auth.getUser(req).user_name;
    let url = userInfoRestApis.getLogList.replace(':user_name', userName);
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, req.query);
};

//激活邮箱
exports.activeUserEmail = function(req, res) {
    return restUtil.authRest.post(
        {
            url: userInfoRestApis.activeUserEmail,
            req: req,
            res: res
        }, null);
};
exports.editUserInfo = function(req, res, userInfo) {
    return restUtil.authRest.put(
        {
            url: userInfoRestApis.editUserInfo,
            req: req,
            res: res
        }, userInfo);
};

exports.setUserLanguage = function(req, res, userLang) {
    return restUtil.authRest.post(
        {
            url: userInfoRestApis.setUserLanguage,
            req: req,
            res: res
        }, userLang);
};

exports.editUserInfoPwd = function(req, res, object) {
    return restUtil.authRest.put(
        {
            url: userInfoRestApis.editUserInfoPwd + '/' + object.userId + '/password',
            req: req,
            res: res
        },
        object.userInfo);
};

exports.checkUserInfoPwd = function(req, res, userInfoPasswd) {
    return restUtil.authRest.get(
        {
            url: userInfoRestApis.checkUserInfoPwd,
            req: req,
            res: res
        },
        {
            passwd: userInfoPasswd
        }, {
            success: function(eventEmitter, data) {
                //处理数据
                eventEmitter.emit('success', data);
            }
        }
    );
};

//获得所管理的安全域
exports.getManagedRealm = function(req, res) {
    let frontUrl = req.host;
    //ketao上， 获取当前登录用户所在的安全域
    let url = userInfoRestApis.getManagedRealm;
    //正式发版的curtao上，获取的是当前登录用户所在的组织
    if(frontUrl === oplateConsts.CURTAO_URL){
        url = userInfoRestApis.getOrganization;
    }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null);
};
//设置订阅通知邮件
exports.setSubscribeEmail = function(req, res, config) {
    return restUtil.authRest.post(
        {
            url: userInfoRestApis.setSubscribeEmail,
            req: req,
            res: res
        }, {config: config});
};

