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
     * Token服务管理
     */
    tokenProvider: tokenProvider
};

