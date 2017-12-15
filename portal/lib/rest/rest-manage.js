/**
 * Created by liwenjun on 2015/12/28.
 */
/**
 * rest 实例管理器。
 * @type {exports}
 */
//需认证rest实例
var userAuthRest = require("./rest-user-auth-extend");
//基本rest实例
var baseRest = require("./rest-basic");
//处理token的rest实例
var tokenProvider = require("./token-provider");
//应用授权rest实例
var appAuthRest = require("./rest-app-auth-extend");


module.exports = {
    /**
     * 基本的rest请求对象
     */
    baseRest: baseRest,
    /**
     * 需认证用户rest请求
     */
    userAuthRest: userAuthRest,
    /**
     * app应用授权接口
     */
    appAuthRest: appAuthRest,
    /**
     * Token服务管理
     */
    tokenProvider: tokenProvider

};

