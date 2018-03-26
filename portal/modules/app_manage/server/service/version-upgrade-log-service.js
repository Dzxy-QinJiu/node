"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var AppUserRestApis = {
    getAppRecordsList: "/rest/base/v1/application/records"
};

exports.urls = AppUserRestApis;

// 获取版本升级日志
exports.getAppRecordsList = function(req, res, obj){
    return restUtil.authRest.get({
        url: AppUserRestApis.getAppRecordsList,
        req: req,
        res: res
    }, obj);
};
