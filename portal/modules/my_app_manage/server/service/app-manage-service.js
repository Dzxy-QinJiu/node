/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by wangliping on 2016/3/4.
 */
"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var App = require("../dto/appObj");
var _ = require("underscore");
var appRestApis = {
    //修改我的应用地址
    modifyApp: "/rest/base/v1/application",
    //刷新应用密钥
    refreshSecret: "/rest/base/v1/application",
    //修改应用到期时间
    updateExpireDate: "/rest/base/v1/application/expire_date",
    //通过id获取应用详细信息
    getCurAppById: "/rest/base/v1/application/id",
    //获取我的应用地址列表
    getUserMyApp: "/rest/base/v1/user/manage_apps",
    // 导出权限
    exportAuthorityList: "/rest/base/v1/permission/export",
    // 导入权限
    importAuthority: "/rest/base/v1/permission/import",
    // 导出角色
    exportRoleList: '/rest/base/v1/role/export',
    // 导入角色
    importRole: "/rest/base/v1/role/import",
    // 获取应用piwik收集key值
    getCurAppKey: "/rest/base/v1/application/piwik/key",
};
exports.urls = appRestApis;

exports.getMyAppList = function (req, res, condition) {
    return restUtil.authRest.get(
        {
            url: appRestApis.getUserMyApp,
            req: req,
            res: res
        }, condition, {
            success: function (eventEmitter, data) {
                //处理数据
                var appListObj = data;
                if (_.isObject(appListObj)) {
                    var curAppList = appListObj.data;
                    for (var i = 0, len = curAppList.length; i < len; i++) {
                        curAppList[i] = App.toFrontObject(curAppList[i]);
                    }
                    appListObj.data = curAppList;
                }
                eventEmitter.emit("success", appListObj);
            }
        });
};

//通过id获取应用的详细信息
exports.getCurAppById = function (req, res, appId) {
    return restUtil.authRest.get(
        {
            url: appRestApis.getCurAppById + "/" + appId,
            req: req,
            res: res
        }, null, {
            success: function (eventEmitter, data) {
                //处理数据
                eventEmitter.emit("success", App.toFrontObject(data));
            }
        });
};

//修改应用
exports.editApp = function (req, res, frontApp) {
    var editApp = App.toRestObject(frontApp);
    return restUtil.authRest.put(
        {
            url: appRestApis.modifyApp,
            req: req,
            res: res
        }, editApp);
};

//刷新应用密钥
exports.refreshAppSecret = function (req, res, appId) {
    return restUtil.authRest.put(
        {
            url: appRestApis.refreshSecret + "/" + appId + "/refresh_secret",
            req: req,
            res: res
        }, null);
};
//修改应用到期时间
exports.updateExpireDate = function (req, res, app) {
    return restUtil.authRest.put(
        {
            url: appRestApis.updateExpireDate,
            req: req,
            res: res
        }, app);
};

// 导出权限
exports.exportAuthorityList = function (req, res, clientID) {
    return restUtil.authRest.get(
        {
            url: appRestApis.exportAuthorityList + "/" + clientID,
            req: req,
            res: res
        }, null, {
            success: function (eventEmitter, data) {
                eventEmitter.emit("success", data);
            }
        });
};

/**
 * 导入权限
 */
exports.uploadAuthority = function (req, res, clientID, data) {
    return restUtil.authRest.post({
        url: appRestApis.importAuthority + "/" + clientID,
        req: req,
        res: res
    }, data);
};

// 导出角色
exports.exportRoleList = function (req, res, clientID) {
    return restUtil.authRest.get(
        {
            url: appRestApis.exportRoleList + "/" + clientID,
            req: req,
            res: res
        }, null, {
            success: function (eventEmitter, data) {
                eventEmitter.emit("success", data);
            }
        });
};

/**
 * 导入角色
 */
exports.uploadRole = function (req, res, clientID, data) {
    return restUtil.authRest.post({
        url: appRestApis.importRole + "/" + clientID,
        req: req,
        res: res
    }, data);
};
// 获取用户类型配置
exports.getCurAppKey = function(req, res, appId){
    return restUtil.authRest.get({
        url: appRestApis.getCurAppKey+ "/" + appId,
        req: req,
        res: res
    }, null);
};