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
    //添加应用地址
    addApp: "/rest/base/v1/application",
    //修改应用地址
    modifyApp: "/rest/base/v1/application",
    //获取应用地址列表
    getApps: "/rest/base/v1/application",
    //通过id获取应用详细信息
    getCurAppById: "/rest/base/v1/application/id"
};
exports.urls = appRestApis;
//获取应用
exports.getApps = function(req, res, condition, isGetAllApp) {
    return restUtil.authRest.get(
        {
            url: appRestApis.getApps,
            req: req,
            res: res
        }, condition, {
            success: function(eventEmitter, data) {
                //处理数据
                var appListObj = data;
                if (_.isObject(appListObj)) {
                    var curAppList = appListObj.data;
                    for (var i = 0, len = curAppList.length; i < len; i++) {
                        if (isGetAllApp) {
                            //获取所有应用列表时，只返回id和name即可
                            curAppList[i] = {
                                id: curAppList[i].client_id,
                                name: curAppList[i].client_name
                            };
                        } else {
                            //获取分页数据
                            curAppList[i] = App.toFrontObject(curAppList[i]);
                        }
                    }
                    appListObj.data = curAppList;
                }
                eventEmitter.emit("success", appListObj);
            }
        });
};

//通过id获取应用的详细信息
exports.getCurAppById = function(req, res, appId) {
    return restUtil.authRest.get(
        {
            url: appRestApis.getCurAppById + "/" + appId,
            req: req,
            res: res
        }, null, {
            success: function(eventEmitter, data) {
                //处理数据
                if (data) {
                    data = App.toFrontObject(data);
                }
                eventEmitter.emit("success", data);
            }
        });
};

//添加应用
exports.addApp = function(req, res, frontApp) {
    var restApp = App.toRestObject(frontApp);
    return restUtil.authRest.post(
        {
            url: appRestApis.addApp,
            req: req,
            res: res
        },
        restApp,
        {
            success: function(eventEmitter, data) {
                //处理数据
                if (_.isObject(data)) {
                    frontApp.id = data.client_id;
                    frontApp.owner = data.owner_id;
                }
                eventEmitter.emit("success", frontApp);
            }
        });
};
//修改应用
exports.editApp = function(req, res, frontApp) {
    var editApp = {};
    if (frontApp.status || frontApp.status == 0) {
        //启用、停用的修改
        editApp = App.toRestStatusObject(frontApp);
    } else {
        editApp = App.toRestObject(frontApp);
    }
    return restUtil.authRest.put(
        {
            url: appRestApis.modifyApp,
            req: req,
            res: res
        }, editApp);
};
