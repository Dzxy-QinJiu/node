"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var AppUserRestApis = {
    getAppNoticeList: "/rest/base/v1/application/notice",
    addAppNotice : "/rest/base/v1/application/notice"
};

exports.urls = AppUserRestApis;

// 获取应用的系统公告
exports.getAppNoticeList = function(req, res, obj){
    return restUtil.authRest.get({
        url: AppUserRestApis.getAppNoticeList,
        req: req,
        res: res
    }, obj);
};

// 添加应用的系统公告
exports.addAppNotice = function(req, res, versionContent){
    return restUtil.authRest.post({
        url: AppUserRestApis.addAppNotice,
        req: req,
        res: res
    }, versionContent);
};
