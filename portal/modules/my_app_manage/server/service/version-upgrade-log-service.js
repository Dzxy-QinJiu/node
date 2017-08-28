"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var AppUserRestApis = {
    getAppRecordsList: "/rest/base/v1/application/records",
    addAppVersion : "/rest/base/v1/application/record",
    uploadVersionUpgrade: "/rest/base/v1/application/upload",
    getAppRecordFile: "/rest/base/v1/application/record/download",
    deleteAppVersionRecord: "/rest/base/v1/application/record/"
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

// 添加版本号和升级内容
exports.addAppVersion = function(req, res, versionContent){
    return restUtil.authRest.post({
        url: AppUserRestApis.addAppVersion,
        req: req,
        res: res
    }, [versionContent]);
};

// 添加版本升级记录上传apk文件
exports.uploadVersionUpgrade = function (req, res, formData) {
    return restUtil.authRest.post({
        url: AppUserRestApis.uploadVersionUpgrade,
        req: req,
        res: res,
        timeout: 600 * 1000,
        formData: formData
    }, null);
};

// 下载版本记录对应的apk文件
exports.getAppRecordFile = function(req, res, obj){
    return restUtil.authRest.get({
        url: AppUserRestApis.getAppRecordFile,
        req: req,
        res: res,
        headers : {
            'Accept': 'application/octet-stream'
        },
        'pipe-download-file': true
    }, obj);
};

// 删除版本升级记录
exports.deleteAppVersionRecord = function(req, res, record_id){
    return restUtil.authRest.del({
        url: AppUserRestApis.deleteAppVersionRecord + "/" +  record_id,
        req: req,
        res: res,
    }, null);
};