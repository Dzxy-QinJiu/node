var path = require("path");
var util = require("util");
var request = util._extend({}, require("./rest-basic"));
var logger = require("../utils/logger").getLogger('auth');
var config = require("../../../conf/config");
var EventEmitter = require("events").EventEmitter;
var CommonUtil = require("../utils/common-utils");

var oauthTokenUrl = "/auth2/authz/token";
var checkUserTokenExistUrl = "/auth2/authz/validate";

// 授权方式
var GRANT_TYPE = {
    PASSWORD: "password",                         // 密码方式
    CLIENT_CREDENTIALS: "client_credentials",     // 应用ID方法
    REFRESH_TOKEN: "refresh_token"                // 刷新token
};
/**
 * 与Token有关的相关方法与属性
 * @constructor
 */
var TokenProvider = function () {
};

/**
 *  设置请求头
 * @param browserReq
 */

function setHeaders(browserReq) {
    var headers = {};
    var serverIps = CommonUtil.ip.getServerAddresses();
    //设置应用服务ip
    headers['remote_addr'] = (serverIps && serverIps[0]) || "127.0.0.1";
    //设置客户端ip
    headers['user_ip'] = CommonUtil.ip.getClientIp(browserReq);
    headers['realm'] = config.loginParams.realm;
    logger.debug("refresh  token headers:" + JSON.stringify(headers));
    return headers;
}
/**
 *   刷新 Access Token
 * 返回的实例中可接收以下几种事件：
 * 1. error:function(errorMsg){} // 刷新Token失败后的事件
 * 2. success:function(token){}  // 刷新Token成功后的事件
 *
 * @param refreshToken
 * @return EventEmitter 的一个新实例
 */

TokenProvider.prototype.refreshAccessToken = function (refreshToken, req, username) {
    logger.debug("user (%s) start refresh Token (" + refreshToken + ") .", username);
    var tokenProvider = new EventEmitter();
    var headers = setHeaders(req);
    request.post({
        "url": oauthTokenUrl,
        headers: headers,
        form: {
            client_id: config.loginParams.clientId,//oplate应用的Id
            client_secret: config.loginParams.clientSecret,//oplate应用秘钥
            grant_type: GRANT_TYPE.REFRESH_TOKEN,
            refresh_token: refreshToken
        }
    }).on('error', function (err, response) {
        logger.error("user (%s) refresh Token (" + refreshToken + ") has error: %s ", username, JSON.stringify(err));
        tokenProvider.emit("error", err, response);
    }).on('fail', function (result, response) {
        logger.debug("user (%s) refresh Token (" + refreshToken + ") is failed: %s ", username, JSON.stringify(result));
        tokenProvider.emit("error", result, response);
    }).on('success', function (result) {
        logger.debug("user (%s) success refresh Token(refresh token): %s , Token(new access_token): %s", username, refreshToken, JSON.stringify(result));
        tokenProvider.emit("success", {access_token: result.access_token, refresh_token: result.refresh_token});
    });

    return tokenProvider;
};


/**
 * 处理 user token 的一些过期等问题
 * 抛出事件：
 * 1. after-token-refresh-successful     // function(newToken) {}
 * 2. refresh-token-expired              // function() {}
 * 3. refresh-token-error                // function(err, response) {}
 * 4. after-token-exist-check            // function(type, data) {}
 * 5. other-force-logout-error           // function(errorCodeNumber) {}
 * 6. other-error                        // function() {}
 *
 * @param errorCode {object}
 * @param token {AccessToken}
 * @param username {string}
 * @param req{req}
 *
 * @return EventEmitter 的一个新实例
 */
TokenProvider.prototype.processUserTokenError = function (errorCode, token, username, req) {
    var self = this, eventEmitter = new EventEmitter();
    var inProcessType = "";
    if (errorCode == 19300 && token) {
        // 1. 拦截 token 过期异常
        inProcessType = "refresh-token";
        logger.debug("user (%s) token was expired or invalid, try to refresh token now.", username);
        self.refreshAccessToken(token, req, username).on("success", function (newToken) {
            logger.debug("user (%s) token refresh success.", username);
            eventEmitter.emit("after-token-refresh-successful", newToken);
        }).on("error", function (result, response) {
            logger.error("user (" + username + ") refresh token has error: ", result);
            eventEmitter.emit("refresh-token-error", result, response);
        });
    } else if (errorCode == 19302 || errorCode == 19301) {
        // 2. 19302 拦截 token 不存在异常,3.19301被踢出
        inProcessType = errorCode == 19302 ? "token-not-exist" : "login-only-one";
        process.nextTick(function () {
            eventEmitter.emit(inProcessType);
            logger.warn("user (%s) token occured authorization error(code: %s) which must be logout.", username, errorCode);
        });
    }
    eventEmitter["inProcessType"] = inProcessType;
    return eventEmitter;
};

var tokenProviderInstance = new TokenProvider();
module.exports = tokenProviderInstance;