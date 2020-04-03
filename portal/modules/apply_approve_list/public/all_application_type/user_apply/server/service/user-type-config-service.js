/**
 * Created by zhshj on 2017/2/14.
 */
'use strict';
var restLogger = require('../../../../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var AppUserRestApis = {
    getUserTypeConfig: '/rest/base/v1/application/extra/grantinfos',
    addUserTypeConfig: '/rest/base/v1/application/extra/grantinfo',
    updateUserTypeConfig: '/rest/base/v1/application/extra/grantinfo'

};
exports.urls = AppUserRestApis;
// 获取用户类型配置
exports.getUserTypeConfig = function(req, res, obj){
    return restUtil.authRest.get({
        url: AppUserRestApis.getUserTypeConfig,
        req: req,
        res: res
    }, obj);
};
// 添加用户类型配置
exports.addUserTypeConfig = function(req, res, obj){
    return restUtil.authRest.post({
        url: AppUserRestApis.addUserTypeConfig,
        req: req,
        res: res
    }, obj);
};
//修改用户类型配置
exports.updateUserTypeConfig = function(req, res, obj){
    return restUtil.authRest.put({
        url: AppUserRestApis.updateUserTypeConfig,
        req: req,
        res: res
    }, obj);
};
