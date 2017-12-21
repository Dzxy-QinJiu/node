var path = require("path");
var util = require("util");
var baseRest = util._extend({}, require("./rest-basic"));
var logger = require("../utils/logger").getLogger('auth');
var config = require("../../../conf/config");
var EventEmitter = require("events").EventEmitter;
var CommonUtil = require("../utils/common-utils");
var AccessToken = require("./access-token");

var oauthTokenUrl = "/auth2/authz/token";
var checkUserTokenExistUrl = "/auth2/authz/validate";

var forceUserOutErrorCodes = {};
if (Array.isArray(config.forceUserOutErrorCodes) && config.forceUserOutErrorCodes.length) {
    config.forceUserOutErrorCodes.forEach(function (code) {
        forceUserOutErrorCodes["" + parseInt(code)] = true;
    });
} else {
    forceUserOutErrorCodes["11042"] = true;
    forceUserOutErrorCodes["11043"] = true;
}

// 授权方式
var GRANT_TYPE = {
    PASSWORD: "password",                         // 密码方式
    CLIENT_CREDENTIALS: "client_credentials",     // 应用ID方法
    REFRESH_TOKEN: "refresh_token"                // 刷新token
};

/**
 * App Key
 */
var appKey = config.loginParams.clientId;
/**
 * App Secret
 */
var appSecret = config.loginParams.clientSecret;
/**
 * realm id
 */
var realmId = config.loginParams.realm;
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
 * 应用级别的Token
 */
var appAccessToken = null;

/**
 * 1. 请求 Application Access Token ；
 * 返回的实例中可接收以下几种事件：
 * 1. error:function(errorMsg){} // 获取Token失败后的事件
 * 2. success:function(token){}  // 获取Token成功后的事件
 *
 * EventEmitter 的一个新实例
 */
var appTokenProvider;
TokenProvider.prototype.requestApplicationAccessToken = function () {
    // 防止多次同时请求（如果有同时多次，将返回当前正在请求的appTokenProvider）
    if (appTokenProvider) {
        return appTokenProvider;
    } else {
        appTokenProvider = new EventEmitter();
    }
    logger.debug("start request application access Token.");
    baseRest.post({
        "url": oauthTokenUrl,
        headers: setHeaders(),
        form: {
            "client_id": appKey,
            "client_secret": appSecret,
            "grant_type": GRANT_TYPE.CLIENT_CREDENTIALS
        }
    }).on('error', function (result, response) {
        logger.error("app token request has error:", "httpCode: " + (response && response.statusCode ? response.statusCode : "null"), result);
        appTokenProvider.emit("error", result, response);
        appTokenProvider = null;
    }).on('fail', function (result, response) {
        logger.error("app token request is failed:", "httpCode: " + (response && response.statusCode ? response.statusCode : "null"), result);
        appTokenProvider.emit("error", result, response);
        appTokenProvider = null;
    }).on('success', function (result) {
        if (result) {
            appAccessToken = new AccessToken(result.access_token, result.expires_in, result.refresh_token);
            logger.info("success fetched appToken (A:%s, R:%s, E:%s)", appAccessToken && appAccessToken.access_token, appAccessToken.refresh_token, appAccessToken.expires_in);
            appTokenProvider.emit("success", appAccessToken);
        } else {
            logger.info("success fetched appToken but result is null");
        }
        appTokenProvider = null;
    })
    return appTokenProvider;
};

var _fetchAppEventEmitter,                   // 统一的事件对象
    _retryDelayTimeInterval = 1000,          // 下次重试的延迟时间的增长间隔
    _currentRetryDelayTime = 0,              // 下次重试的延迟时间
    _retryDelayMaxTime = 1000 * 60,          // 下次重试的延迟时间的最大值(即: 下次重试的时间不得超过这个值)
    _inFetchingAppToken = false,             // 当前是否正在远程获取appToken当中
    _nextFetchAppTokenTime = undefined,      // 下次远程获取获取appToken的有效时间点(即: 下次远程获取appToken的时间点需要小于这个时间点)
    _maxFetchAppTokenTime = 1000 * 60 * 5;   // 计算下次远程获取appToken的有效时间点, 需要用到这个值;
/**
 * 2. 获取 appToken, token过期之后, 将会自动的刷新token(这里没有调用 refreshToken 方法, 是因为 这个 appToken 在分布式下有多个应用正在使用)
 * 抛出事件: (注意: 这里没有失败的事件抛出, 即不管等多久, 都会抛出一个成功的事件)
 * 1. success        // function(token) {}
 *
 * @param force {boolean} 是否强制到业务服务器中获取appToken
 * @returns {EventEmitter}
 */
TokenProvider.prototype.fetchAppToken = function (force) {
    if (_fetchAppEventEmitter) {
        if (force) {
            _currentRetryDelayTime = 0;
        }
        return _fetchAppEventEmitter;
    } else {
        _fetchAppEventEmitter = new EventEmitter();
    }

    var tokenProvider = this;
    var fetchHandler = function (once) {
        tokenProvider.requestApplicationAccessToken().on("success", function (token) {
            _inFetchingAppToken = false;
            // 重新设定下一次获取token的时间
            _nextFetchAppTokenTime = Math.min(token.expires_at - 1000 * 60, Date.now() + _maxFetchAppTokenTime);
            _fetchAppEventEmitter.emit("success", token);
            _fetchAppEventEmitter = null;
            //logger.info("请求获取 appToken (A:%s, R:%s, E:%s) 成功，_nextFetchAppTokenTime: %s", token.access_token, token.refresh_token, token.expires_in, (new Date(_nextFetchAppTokenTime)).toTimeString());
        }).on("error", function () {
            if (!once) {
                _currentRetryDelayTime = Math.min(_currentRetryDelayTime + _retryDelayTimeInterval, _retryDelayMaxTime);
                logger.error("application token fetch error, and " + (_currentRetryDelayTime / 1000) + "s later will retry.");
                setTimeout(fetchHandler, _currentRetryDelayTime);
            }
        });
    };

    if (
        !force &&
        (
            appAccessToken &&
            (appAccessToken.expires_at - Date.now()) > 0 &&
            (_nextFetchAppTokenTime === undefined || (_nextFetchAppTokenTime - Date.now()) > 0)
        )
    ) {
        // 重新设定下一次获取token的时间
        _nextFetchAppTokenTime = Math.min(appAccessToken.expires_at - 1000 * 60, Date.now() + _maxFetchAppTokenTime);

        process.nextTick(function () {
            _fetchAppEventEmitter.emit("success", appAccessToken);
            _fetchAppEventEmitter = null;
        });
    } else {
        if (!_inFetchingAppToken) {
            _currentRetryDelayTime = 0;
            _inFetchingAppToken = true;
            fetchHandler(false);
        } else {
            fetchHandler(true);
        }
    }

    return _fetchAppEventEmitter;
};

/**
 * 3. 是否正在获取 appToken 当中
 * @returns {boolean}
 */
TokenProvider.prototype.isInFetchingAppToken = function () {
    return _inFetchingAppToken;
};


/**
 *   4. 刷新 Access Token
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
    baseRest.post({
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
        tokenProvider.emit("success", {
            access_token: result && result.access_token,
            refresh_token: result && result.refresh_token
        });
    });

    return tokenProvider;
};


/**
 * 5. 处理 user token 的一些过期等问题
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
    } else if (errorCode == 19302 || errorCode == 19301 || errorCode == 11473) {
        //  11011,19302 拦截 token 不存在异常; 19301被踢出 ;   11473  token 被单点退出
        switch (errorCode) {
            case 19301:
                inProcessType = "login-only-one";
                break;
            case 19302:
                inProcessType = "token-not-exist";
                break;
            case 11473:
                inProcessType = "token-kicked-by-sso";
                break;
        }
        process.nextTick(function () {
            eventEmitter.emit(inProcessType);
            logger.warn("user (%s) token occured authorization error(code: %s) which must be logout.", username, errorCode);
        });
    }
    eventEmitter["inProcessType"] = inProcessType;
    return eventEmitter;
};


/**
 * 7. 处理 app token 的一些过期等问题
 * 抛出事件：
 * 1. token-reFetched                    // function(token) {}
 *
 * @param errorCode {object}
 *
 * @return EventEmitter 的一个新实例
 */
TokenProvider.prototype.processAppTokenError = function (errorCode) {
    var self = this, eventEmitter = new EventEmitter();

    // 不管是 Token过期, 还是 Token不存在, 都自动的再次获取 appToken (非刷新机制)
    if (errorCode === 11012 || errorCode == 11011) {
        appAccessToken = null;
        eventEmitter["inProcessType"] = "re-fetching-app-token";
        process.nextTick(function () {
            tokenProviderInstance.fetchAppToken(true).on("success", function (token) {
                eventEmitter.emit("token-reFetched", token);
            });
        });
    }

    return eventEmitter;
};

/**
 * 8. 一些配置信息
 * @type {{getAppKey: Function, getAppSecret: Function, getAppToken: Function}}
 */
TokenProvider.prototype.config = {
    getAppKey: function () {
        return appKey;
    },
    getAppSecret: function () {
        return appSecret;
    },
    getAppToken: function () {
        return appAccessToken;
    },
    getRealm: function () {
        return realmId;
    }
};

var tokenProviderInstance = new TokenProvider();

// 程序启动时就已开始请求了 Application Access Token 数据了
process.nextTick(function () {
    tokenProviderInstance.fetchAppToken();
});

module.exports = tokenProviderInstance;