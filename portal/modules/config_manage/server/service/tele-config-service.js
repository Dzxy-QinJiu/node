/**
 * 客服电话配置的service
 * */

"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var telePaths = {
    add: "/rest/customer/v2/callrecord/invalid_phone",
    del: "/rest/customer/v2/callrecord/invalid_phone/",
    get: "/rest/customer/v2/callrecord/invalid_phone"
}

exports.urls = telePaths;

// 获取电话 
exports.getTele = function (req, res) {
    return restUtil.authRest.get({
        url: telePaths.get,
        req: req,
        res: res
    }, null);
};

//添加电话
exports.addTele = function (req, res, param) {
    return restUtil.authRest.post({
        url: telePaths.add,
        req: req,
        res: res
    }, param);
};

//删除电话
exports.delTele = function (req, res, param) {
    return restUtil.authRest.del({
        url: telePaths.del + param.phone,
        req: req,
        res: res
    }, null);
};

