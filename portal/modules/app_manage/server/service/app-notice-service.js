"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var AppUserRestApis = {
    getAppNoticeList: "/rest/base/v1/application/notice"
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