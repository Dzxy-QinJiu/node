/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';

var path = require('path');
var util = require('util');
var extend = require('extend');
var DesktopIndexService = require('../service/destktop-index-service');
var multiparty = require('multiparty');
var fs = require('fs');
var approot = require('app-root-path');
var mkdirp = require('mkdirp');
var fileExistsSync = require('../../../lib/utils/existsSync');
var auth = require('../../../lib/utils/auth');
let _ = require('lodash');
let moment = require('moment');
const commonUtil = require('../../../lib/utils/common-utils');
const authRouters = require('../../../lib/authRouters');
let BackendIntl = require('../../../../portal/lib/utils/backend_intl');
/*
 * home page handler.
 */
exports.home = function(req, res) {
    let isCurtao = commonUtil.method.isCurtao(req);
    let user = auth.getUser(req);
    // 委内维拉项目隐藏一些项的属性
    let hideSomeItem = '';
    if (global.config.lang && global.config.lang === 'es_VE') {
        hideSomeItem = 'true';
    }
    let showWelComePage = req.session.showWelComePage;
    //如果没有展示过欢迎页
    if(showWelComePage) {
        //而且欢迎页只展示一次
        req.session.showWelComePage = false;
        //发送设置网站个性化的配置
        setWebsiteConfig(req, res, commonUtil.CONSTS.WELCOME_PAGE_FIELD);
    }
    let custom_service_lang = global.config.lang || 'zh_CN';
    custom_service_lang = custom_service_lang === 'zh_CN' ? 'ZHCN' : 'EN';
    let roles = _.map(user.role_infos, 'role_name') || [];
    let backendIntl = new BackendIntl(req);
    res.render('home/tpl/desktop-index', {
        isFormal: global.config.isFormal,
        userid: user.user_id,
        username: user.user_name,
        nickname: user.nick_name,
        organization: _.get(user, 'organization.officialName', ''),
        role: roles.join(','),
        siteID: global.config.siteID,
        lang: global.config.lang || '',
        custom_service_lang: custom_service_lang,
        hideSomeItem: hideSomeItem,
        projectName: global.config.processTitle || 'oplate',
        clientId: global.config.loginParams.clientId,
        useSso: global.config.useSso,
        isCurtao: isCurtao,
        timeStamp: global.config.timeStamp,
        loadingText: backendIntl.get('common.sales.frontpage.loading', '加载中'),
        productsIdMap: JSON.stringify({
            cash: global.config.cashClientId,
            caller: global.config.callerClientId,
        }),
        ssoUrl: global.config.ssoUrl,
        antmeActorUrl: global.config.antmeActorUrl,
        antmeClientId: global.config.antmeClientId,
        forceLogin: _.get(req.session,'force_login', true),
        showWelComePage: showWelComePage,
        welcomePageInfo: {
            title: backendIntl.get('personal.welcome.title.tip', '欢迎使用客套系统!'),
            closeText: backendIntl.get('personal.welcome.enter.system', '进入系统'),
            content: backendIntl.get('personal.welcome.public.account', '关注公众号，获得更多信息')
        }
    });
};

/**
 * 获取权限
 */
exports.getUserData = function(req, res) {
    var userSession = auth.getUser(req);
    var user = extend(true, {}, userSession);
    user.privileges = DesktopIndexService.getPrivileges(req);
    user.routes = authRouters.getAuthedRouters(user.privileges);
    //删除认证数据
    delete user.auth.access_token;
    delete user.auth.refresh_token;
    var callback = req.query.callback;
    console.time('用户信息相关接口============================');
    DesktopIndexService.getUserInfo(req, res)
        .on('success', function(data) {
            console.timeEnd('用户信息相关接口============================');
            //将界面上可能会修改到的登录用户的信息进行刷新
            user.email = data.email;
            user.email_enable = data.email_enable;
            user.user_logo = data.user_logo;
            user.nick_name = data.nick_name;
            user.team_id = data.team_id;
            user.team_name = data.team_name;
            user.roles = _.get(req.session, 'user.roles');
            user.lang = _.get(data, 'language_setting.language', global.config.lang || 'zh_CN');
            user.isCommonSales = data.isCommonSales;//是否是普通销售
            if (data.isCommonSales) {
                user.position = data.position;//职务
            }
            user.workFlowConfigs = data.workFlowConfigs;//配置过的流程列表
            user.phone = data.phone;
            user.websiteConfig = data.websiteConfig;//网站个性化
            user.organization = {
                id: _.get(data, 'organization.id', ''),
                officialName: _.get(data, 'organization.official_name', ''),
                functions: _.get(data, 'organization.functions', []),
                type: _.get(data, 'organization.type', ''),
                version: _.get(data, 'organization.version', {}),
                endTime: _.get(data, 'organization.end_time', ''),
                expireAfterDays: _.get(data, 'organization.expire_after_days'),
                grantProducts: _.get(data, 'organization.grant_products', []),
                // 组织是否过期
                isExpired: _.get(data, 'organization.end_time', '') <= new Date().getTime()
            };
            req.session.user.nickname = data.nick_name;
            moment.locale(user.lang);
            req.session.lang = user.lang;
            req.session.save(function() {
                res.header('Content-Type', 'application/javascript');
                res.send(callback + '(' + JSON.stringify(user) + ')');
            });
            //直接请求的内部模块的链接
            user.preUrl = req.session.preUrl;
            //取完数据后，删除preUrl
            delete req.session.preUrl;
        }).on('error', function(codeMessage) {
            res.header('Content-Type', 'application/javascript');
            let lang = global.config.lang || 'zh_CN';
            moment.locale(lang);
            req.session.save();
            let errorObj = { lang: lang, errorMsg: codeMessage && codeMessage.message };
            res.status(500).send(callback + '(' + JSON.stringify(errorObj) + ')');
        });
};

/**
 * 上传
 */
exports.upload = function(req, res) {
    //构造上传表单
    //multiparty模块详细用法参见：https://github.com/andrewrk/node-multiparty
    var form = new multiparty.Form();

    //开始处理上传请求
    form.parse(req, function(err, fields, files) {
        var uploadDir = 'upload';
        var subDir = fields['subdir'][0];
        var tmpPath = files['file'][0].path;
        var fileName = path.basename(tmpPath);
        var relativePath = uploadDir + '/' + subDir + '/' + fileName;
        var finalPath = path.resolve(approot.path, relativePath);
        var finalPathDir = path.dirname(finalPath);
        if (!fileExistsSync(finalPathDir)) {
            mkdirp.sync(finalPathDir);
        }

        var readStream = fs.createReadStream(tmpPath);
        var writeStream = fs.createWriteStream(finalPath);

        util.pump(readStream, writeStream, function() {
            fs.unlinkSync(tmpPath);
            res.json({path: '/' + relativePath});
        });
    });
};

/**
 * 显示测试结果
 */
exports.test = function(req, res) {
    res.render('home/tpl/test');
};

// 微信检测
exports.getAppQrCodeAgent = function(req, res) {
    res.render('home/tpl/weixin-inspector');
};
//邮箱激活
exports.activeEmail = function(req, res) {
    DesktopIndexService.activeEmail(req, res, req.query.code).on('success', function(data) {
        res.set('Content-Type', 'text/html');
        res.send(data);
    }).on('error', function(errorObj) {
        res.set('Content-Type', 'text/html');
        res.send(errorObj && errorObj.message);
    });
};

//记录页面的日志
exports.recordLog = function(req, res) {
    DesktopIndexService.recordLog(req, res, req.query.message);
    res.send('');
};

//根据手机号获取用户所在区域
exports.getUserAreaData = function(req, res) {
    DesktopIndexService.getUserAreaData(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(err) {
        res.json(err.message);
    });
};

//设置antme是否强制登陆（主要为刷新界面后的状态使用）
exports.setForceLogin = function(req, res) {
    req.session.force_login = false;
    req.session.save(function() {
        res.json({force_login: req.session.force_login});
    });
};

//设置网站个性化设置
function setWebsiteConfig(req, res, field) {
    let data = {
        [field]: true
    };
    DesktopIndexService.setWebsiteConfig(req, res, data);
}