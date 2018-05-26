/**
 * IP配置的service
 * */

"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var IpConfigRestApis = {
    IpConfigPath: '/rest/base/v1/realm/config/ip', // IP配置路径（获取、添加和删除）
    filterLanIp: '/rest/base/v1/realm/config/lan_filter' // 安全域过滤内网网段（添加、获取）
};

exports.urls = IpConfigRestApis;

// 获取IP配置
exports.getIpConfigList = function(req, res, obj){
    return restUtil.authRest.get({
        url: IpConfigRestApis.IpConfigPath,
        req: req,
        res: res
    }, obj);
};

// 添加IP配置
exports.addIpConfigItem = function(req, res, addIpObj){
    return restUtil.authRest.post({
        url: IpConfigRestApis.IpConfigPath,
        req: req,
        res: res
    }, addIpObj);
};

// 删除IP配置
exports.deleteIpConfigItem = function(req, res, id){
    return restUtil.authRest.del({
        url: IpConfigRestApis.IpConfigPath + "/" + id,
        req: req,
        res: res
    }, null);
};

// 添加安全域过滤内网网段
exports.filterIp = function(req, res, filterObj) {
    return restUtil.authRest.post({
        url: IpConfigRestApis.filterLanIp,
        req: req,
        res: res
    }, filterObj);
};

// 获取安全域过滤内网网段
exports.getFilterIp = function(req, res) {
    return restUtil.authRest.get({
        url: IpConfigRestApis.filterLanIp,
        req: req,
        res: res
    }, null);
};