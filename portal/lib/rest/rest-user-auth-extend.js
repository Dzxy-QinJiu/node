/**
 * Created by liwenjun on 2015/12/27.
 */

/**
 * request  扩展
 */
var util = require("util");
var authRequest = util._extend({}, require("./rest-basic"));
var baseRequest = util._extend({}, require("./rest-basic"));
var logger = require("./../utils/logger").getLogger('auth');
var tokenProvider = require("./token-provider");
var EventEmitter = require("events").EventEmitter;
var auth = require("./../utils/auth");
var Request = require('request').Request;
var constUtil = require("./const-util");

var RestlerExtend = {
    prepareRequest: function (req, res) {
        var requestInstance = this, accessToken, refreshToken;
        //从req session中获取user
        var userBaseInfo = auth.getUser(req);
        //从req session中获取token
        accessToken = userBaseInfo.auth.access_token;
        //从req session中获取refresh_token
        refreshToken = userBaseInfo.auth.refresh_token;
        // 无效token，直接返回。
        if (!accessToken) {
            logger.debug("No UserAccessToken Found In Session, Try Next Time.");
            requestInstance.abort();
            process.nextTick(function () {
                var errorCodeDesc = {
                    "errorCode": "00116"
                }, custom_resp = {
                    statusCode: 500,
                    raw: "Rest-user-auth-extend主动抛出的自定义异常信息(UserTokenRequest): " + JSON.stringify(errorCodeDesc)
                };
                requestInstance.emit('error', errorCodeDesc, custom_resp);
                requestInstance.emit('complete', errorCodeDesc, custom_resp);
            });
            return requestInstance;
        }
        setAuthHeader(requestInstance, accessToken, userBaseInfo ? userBaseInfo.auth.realm_id : "", userBaseInfo ? userBaseInfo.user_id : "");
        // 代理 complete, fail 方法，以方便对授权出错的拦截
        process.nextTick((function () {
            var requestInstance = this, i, h_completes = requestInstance.listeners("complete"),
                h_fails = requestInstance.listeners("fail");
            var proxyHandler = function (handers) {
                var requestInstance = this, args = Array.prototype.slice.apply(arguments, [1]);
                if (!requestInstance["_process_token_validate"]) {
                    for (i = 0; i < handers.length; i++) {
                        handers[i].apply(requestInstance, args);
                    }
                }
            };
            requestInstance._events["fail"] = [requestInstance._events["oauth-proxy-fail"]];
            delete requestInstance._events["oauth-proxy-fail"];
            requestInstance._events["fail"].push(proxyHandler.bind(requestInstance, h_fails));
            requestInstance._events["complete"] = proxyHandler.bind(requestInstance, h_completes);
        }).bind(requestInstance));

        // 授权出错的拦截
        requestInstance.on("oauth-proxy-fail", function (errorObj, response) {
            var errorCode = (errorObj && typeof errorObj == "object") ? parseInt(errorObj["error_code"] || errorObj["errorCode"]) : false;
            //实参 1标示用户访问token
            if (constUtil.tokenIsInvalid(errorCode, 1)) {
                logger.debug(" req.session.refreshingToken:" + req.session.refreshingToken);
                if (req.session.refreshingToken) {
                    requestInstance["_process_token_validate"] = true;
                    authRequest.globalEmitter.once(constUtil.errors.REFRESH_TOKEN_SUCCESS, function (newToken, refreshedUser) {
                        //如果刷新token的rest请求中，用户原始token和当前rest请求的用户原始token一致
                        logger.debug("Other waited request  user :" + userBaseInfo.user_id + ",refreshedUser :" + refreshedUser.user_id);
                        if (refreshedUser && refreshedUser.auth && userBaseInfo && userBaseInfo.auth && refreshedUser.auth.access_token == userBaseInfo.auth.access_token) {
                            delete requestInstance["_process_token_validate"];
                            // 根据新token重新发送请求
                            logger.debug("user (%s) Other waited request get new_access_token :" + newToken.access_token, userBaseInfo.user_name);
                            logger.debug("user (%s) Other waited request url :" + requestInstance.restOptions.method + "  " + requestInstance.restOptions.url, userBaseInfo.user_name);
                            reTryRequest(requestInstance, newToken.access_token, userBaseInfo, req, res);
                        }
                    });
                    authRequest.globalEmitter.once(constUtil.errors.REFRESH_TOKEN_ERROR, function (err, response) {
                        delete requestInstance["_process_token_validate"];
                        requestInstance.emit("fail", err, response);
                    });
                } else {
                    //终止正常流程的错误处理
                    requestInstance["_process_token_validate"] = true;
                    if (errorCode == 19300) {//19300 是token过期的情况，可以刷新token后重新发请求
                        var retEmitter = tokenProvider.processUserTokenError(errorCode, refreshToken, userBaseInfo.user_name, req);
                        if (retEmitter["inProcessType"]) {
                            req.session.refreshingToken = true;
                            retEmitter.once(constUtil.errors.REFRESH_TOKEN_SUCCESS, function (newToken) {
                                handleFlag(requestInstance, req);
                                logger.debug("user (%s) Current request get new_access_token: " + newToken.access_token, userBaseInfo.user_name);
                                logger.debug("user (%s) Current request url :" + requestInstance.restOptions.method + "  " + requestInstance.restOptions.url, userBaseInfo.user_name);
                                logger.debug("user (%s) Current request user :" + userBaseInfo.user_id, userBaseInfo.user_name);
                                // 将新 token 抛出去
                                authRequest.globalEmitter.emit(constUtil.errors.REFRESH_TOKEN_SUCCESS, newToken, userBaseInfo, req);
                                // 根据新token重新发送请求
                                reTryRequest(requestInstance, newToken.access_token, userBaseInfo, req, res);
                            }).once(constUtil.errors.REFRESH_TOKEN_ERROR, function () {
                                req.session.refreshingToken = false;
                                authRequest.globalEmitter.emit(constUtil.errors.GLOBAL_ERROR, req, res,constUtil.errors.REFRESH_TOKEN_ERROR);
                            })
                        }
                    } else {
                        //其他错误直接返回（emitter到全局控制）
                        var error = constUtil.userTokenErrorCodeMessageMap[errorCode] || constUtil.commonErrorCodeMessageMap[errorCode];
                        logger.debug("user (%s) %s", userBaseInfo.user_name, error);
                        logger.warn("user (%s) token occured authorization error(code: %s) which must be logout.", userBaseInfo.user_name, errorCode);
                        authRequest.globalEmitter.emit(constUtil.errors.GLOBAL_ERROR, req, res, error);
                    }
                }

            }
        });
        return requestInstance;
    }
}
/**
 * 设置认证头信息
 */
function setAuthHeader(requestInstance, accessToken, realm_id, user_id) {
    // 1. 将 accessToken 放入请求头中
    requestInstance.setHeader("token", accessToken);
    //兼容auth2,退出登录时需要使用，不能删除
    requestInstance.setHeader("Authorization", "oauth2 " + accessToken);
    //将realm_id，user_id放入请求头
    requestInstance.setHeader("realm", realm_id);
    requestInstance.setHeader("user_id", user_id);
}
/**
 * 处理流程控制开关。
 */
function handleFlag(requestInstance, req) {
    req.session.refreshingToken = false;
    delete requestInstance["_process_token_validate"];
}
/**
 * 根据新token重新发送请求。
 * @param requestInstance
 * @param newToken
 * @param req request对象
 * @param res response对象
 */
function reTryRequest(requestInstance, newToken, userBaseInfo, req, res) {
    requestInstance.req.removeAllListeners().on('error', function () {
    });
    requestInstance.removeAllListeners('end').on('error', function () {
    });
    requestInstance.removeAllListeners('data').on('error', function () {
    });
    if (requestInstance.req.finished) {
        requestInstance.req.abort();
    }
    requestInstance.restOptions.callback = function () {
    };
    requestInstance._callbackCalled = false;
    requestInstance._started = false;
    logger.debug("Resending request :" + JSON.stringify(requestInstance.restOptions));
    Request.call(requestInstance, requestInstance.restOptions);
    //重新设置认证数据
    setAuthHeader(requestInstance, newToken, userBaseInfo ? userBaseInfo.auth.realm_id : "", userBaseInfo ? userBaseInfo.user_id : "");
    if (requestInstance.restOptions['pipe-upload-file']) {
        req.pipe(requestInstance);
    } else if (requestInstance.restOptions['pipe-download-file']) {
        requestInstance.pipe(res);
    }
    //console.log(new Date().toString() + " after start");
}
/**
 * 从 Request 内抽取出来的，并有所改动
 */
var baseRequestOverride = {
    get: function (options, req, res) {
        return RestlerExtend.prepareRequest.call(baseRequest.get(options, req, res), req, res);
    },
    post: function (options, req, res) {
        return RestlerExtend.prepareRequest.call(baseRequest.post(options, req, res), req, res);
    },
    put: function (options, req, res) {
        return RestlerExtend.prepareRequest.call(baseRequest.put(options, req, res), req, res);
    },
    del: function (options, req, res) {
        return RestlerExtend.prepareRequest.call(baseRequest.del(options, req, res), req, res);
    }
};

// 重载 get 方法
authRequest.get = baseRequestOverride.get;
// 重载 post 方法
authRequest.post = baseRequestOverride.post;
// 重载 put 方法
authRequest.put = baseRequestOverride.put;
// 重载 del 方法
authRequest.del = baseRequestOverride.del;
//全局emitter
authRequest.globalEmitter = new EventEmitter();


module.exports = authRequest;