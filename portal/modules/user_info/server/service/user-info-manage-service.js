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
    getUserInfo: '/rest/base/v1/user/member/self', // 获取成员自身信息
    getLogList: '/rest/analysis/auditlog/v1/login/:user_name/drop_down_load',
    editUserInfo: '/rest/base/v1/user/baseinfo',
    setUserLanguage: '/rest/base/v1/user/member/language/setting',
    checkUserInfoPwd: '/rest/base/checkUserInfoPwd',
    editUserInfoPwd: '/rest/base/v1/user',
    activeUserEmail: '/rest/base/v1/user/bunding/email',//邮箱激活接口
    getManagedRealm: '/rest/base/v1/realm/managedrealm',//获取当前登录用户所在的组织
    setSubscribeEmail: '/rest/base/v1/user/email/rejection',//是否订阅通知邮件
    getUserInfoPhoneCode: '/rest/base/v1/user/bunding/phone',//获取短信验证码
    bindUserInfoPhone: '/rest/base/v1/user/baseinfo',//绑定邮箱
    getUserTradeRecord: '/pay/trade/curtao/orders', // 获取用户交易记录（后端描述：交易客套中的记录列表，加注释目的，方便查找接口）
};

exports.urls = userInfoRestApis;

exports.getUserInfo = (req, res) => {
    return restUtil.authRest.get(
        {
            url: userInfoRestApis.getUserInfo,
            req: req,
            res: res
        }, {}, {
            success: (eventEmitter, data) => {
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
                        reject: data.reject,
                        qq: data.qq || ''
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
        }, req.body);
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
    return restUtil.authRest.get(
        {
            url: userInfoRestApis.getManagedRealm,
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
//获取短信验证码
exports.getUserInfoPhoneCode = function(req, res) {
    return restUtil.authRest.get(
        {
            url: userInfoRestApis.getUserInfoPhoneCode,
            req: req,
            res: res,
        }, req.query);
};
//绑定用户的手机号
exports.bindUserInfoPhone = function(req, res) {
    return restUtil.authRest.put(
        {
            url: userInfoRestApis.bindUserInfoPhone,
            req: req,
            res: res,
        }, req.body);
};

// 获取用户交易记录
exports.getUserTradeRecord = (req, res) => {
    return restUtil.authRest.get(
        {
            url: userInfoRestApis.getUserTradeRecord,
            req: req,
            res: res,
        }, req.query, {
            success: (eventEmitter, data) => {
                let list = _.get(data, 'list');
                let frontData = {list: [], total: 0};
                if(data.total && list) {
                    // 前端只需要展示支付成功的购买记录
                    let filterData = _.filter(list, item => item.status === 1);
                    frontData.list = filterData;
                    frontData.total = filterData.length;
                }
                eventEmitter.emit('success', frontData);
            },
            error: (eventEmitter, errorObj) => {
                eventEmitter.emit('error', errorObj.message);
            }
        });
};