/**
 * IP配置的service
 * */

'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var RealmConfigRestApis = {
    setConfig: '/rest/base/v1/realm/password/strategy', // IP配置路径（获取、添加和删除）
    getConfig: '/rest/base/v1/realm/password/strategy' // 安全域过滤内网网段（添加、获取）
};

exports.urls = RealmConfigRestApis;

// 设置安全策略
exports.setRealmStrategy = function(req, res, obj) {
    return restUtil.authRest.post({
        url: RealmConfigRestApis.setConfig,
        req: req,
        res: res
    }, obj);
};

// 获取安全策略
exports.getRealmStrategy = function(req, res) {
    return restUtil.authRest.get({
        url: RealmConfigRestApis.getConfig,
        req: req,
        res: res
    });
};
