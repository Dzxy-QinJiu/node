/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';

/**
 * 所有请求路由资源控制器
 */

/**
 * 是否已初始化过
 */
var isInited = false;
var path = require('path');
var util = require('util');
var fs = require('fs');
var readDirRecursive = require('./lib/utils/readDirRecursive');
require('babel-core/register');

/**
 * 初始化 资源控制器
 * @param app express app
 */
var initController = function(app) {
    if (isInited) {
        return;
    }
    isInited = true;

    var privilegesChecker = require('./controller-privileges');
    var passportChecker = require('./controller-passport');
    var modulesPath = path.join(__dirname, 'modules');

    var files = readDirRecursive(modulesPath);
    files.forEach(function(fp) {
        if(!/\.http\.js$/.test(fp)) {
            return;
        }
        var routeConfig = require(fp);
        if (!routeConfig.module || !routeConfig.routes || !routeConfig.routes.length) {return;}
        routeConfig.routes.forEach(function(route) {
            try {
                route.passport = route.passport === undefined ? routeConfig.passport : route.passport;
                route.passport = (route.passport === undefined || route.passport === true) ? {
                    'needLogin': true
                } : route.passport;
                route.passport = (route.passport === false) ? {'needLogin': false} : route.passport;
                app[route.method](route.path, passportChecker(route.passport), privilegesChecker(route.passport, route.privileges), require(path.resolve(__dirname , './modules' , route.module || routeConfig.module))[route.handler]);
            } catch (error) {
                // 加载路由错误时，显示当前的错误信息，并抛出异常。
                // eslint-disable-next-line no-console
                console.error('加载路由错误: \n文件路径:%s \n错误信息:%s', JSON.stringify(route , null , 4) , error.message);
                throw error;
            }
        });
        //加载nock数据
        if(config.provideNockData) {
            var moduleDir = path.dirname(fp);
            var nock = path.resolve(moduleDir , '../nock/index.js');
            if(fs.existsSync(nock)) {
                try {
                    require(nock).init();
                } catch(error){
                    // 加载nock错误时，显示当前的错误信息，并抛出异常。
                    // eslint-disable-next-line no-console
                    console.error('加载nock错误: \n文件路径:%s \n错误信息:%s' , nock , error.message);
                }
            }
        }
    });

    //处理通用rest请求
    app.all('/rest/*', passportChecker({needLogin: true}), require('./lib/middlewares/rest'));

    //处理强制使用的通用rest请求
    app.all('/force_use_common_rest/rest/*', passportChecker({needLogin: true}), require('./lib/middlewares/rest'));

    // 处理所有前面未拦截的请求处理
    // 1. 未登录：重定向到登录页
    // 2. 已登录：重定向到首页
    app.use(function(req, res, next) {
        if (!/(^\/favicon\.ico$)|(\.(js|css|png|jpg|gif|woff2?|ttf|eot|svg)$)/i.test(req.originalUrl)) {
            if (!req.session || !req.session.user) {
                if (global.config.useSso) {
                    //sso登录的情况下，超时需要加stopcheck参数，防止再次sso校验登录
                    return res.redirect('/login?stopcheck=true');
                } else {
                    return res.redirect('/login');
                }
            } else {
                return res.redirect('/');
            }
        } else {
            next();
        }
    });
};

/**
 * 将一些系统变量放入 app.locals 中，以方便在view（ejs）中使用；
 * 使用方法：<%= locals.version %>
 *
 * @param app express app
 */
var setAppConfig = function(app) {
    util._extend(app.locals, {
        isProduction: config.isProduction,
        webpackMode: config.webpackMode
    });
};

/**
 * @param app express app
 * @returns {Function}
 */
module.exports = function(app) {
    setAppConfig(app);
    initController(app);

    return app;
};
