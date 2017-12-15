/**
 * Created by wuyaoqian on 13-11-17. <br />
 */

"use strict";

/**
 * 从认证授权服务器获得的 AccessToken 对象
 * @param accessToken
 * @param expiredIn
 * @param refreshToken
 * @constructor
 */
var AccessToken = function (accessToken, expiredIn, refreshToken) {

    /**
     * token 字符串
     * @type {string}
     */
    this.access_token = accessToken;
    /**
     * token 将在 N 秒后过期
     * @type {int}
     */
    this.expires_in = expiredIn;

    /**
     * 用于 刷新原token的一个临时 token
     * @type {string}
     */
    this.refresh_token = refreshToken;

    /**
     * token 将大约在 expires_at 时间点后过期（根据 expiredIn 计算得出）
     * @type {int}
     */
    this.expires_at = Date.now() + (expiredIn * 1000);

};

/**
 * 使用方法： var token = require("./lib/AccessToken")(token, type, expiredIn, refreshToken);
 * @returns {AccessToken}
 */
module.exports = function (accessToken, expiredIn, refreshToken) {
    return new AccessToken(accessToken, expiredIn, refreshToken);
};