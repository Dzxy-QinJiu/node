/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */


/**
 * 在 restler-base-extend.js 的基础上再次扩展 restler 使其自动加入 appToken 等想关代码
 * Created by wuyaoqian on 15/5/28.
 */

var util = require("util");
var baseRest = util._extend({}, require("./rest-basic"));
var appAuthRest = util._extend({}, require("./rest-basic"));
var tokenProvider = require("./token-provider");
var logger = require("./../utils/logger").getLogger('auth');
var Request = require('request').Request;
var EventEmitter = require("events").EventEmitter;
var constUtil = require("./const-util");
/**
 * Restler 的一些相关扩展
 */
var RestlerExtend = {
    /**
     * 扩展 请求处理 的方法
     * @returns {RestlerOverride}
     */
    prepareRequest: function (req, res) {
        var instance = this;
        var appToken = tokenProvider.config.getAppToken();
        var realmId = tokenProvider.config.getRealm();
        if (!appToken || !appToken.access_token) {
            logger.debug("No AppAccessToken Found In Memory, Try Next Time.");
            tokenProvider.fetchAppToken();
            instance.abort();
            process.nextTick(function () {
                var errorCodeDesc = {
                    "errorCode": "00116",
                    "httpStatusCode": 500,
                    "description": "请求体中没有带token",
                    "type": "公共基础异常"
                }, custom_resp = {
                    statusCode: 500,
                    raw: "这是SDK主动抛出的自定义异常信息(AppTokenRequest): " + JSON.stringify(errorCodeDesc)
                };
                instance.emit('error', errorCodeDesc, custom_resp);
                instance.emit('complete', errorCodeDesc, custom_resp);
            });
            return instance;
        }
        setAuthHeader(instance, appToken.access_token, realmId);
        // 代理 complete, fail, 400, 4XX 方法，以方便对授权出错的拦截
        process.nextTick((function () {
            var requestInstance = this, i,
                h_completes = requestInstance.listeners("complete"),
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
        }).bind(instance));

        // 授权出错的拦截
        instance.on("oauth-proxy-fail", function (errorObj, response) {

            var retEmitter,
                errorCode = (errorObj && typeof errorObj === "object") ? parseInt(errorObj["error_code"] || errorObj["errorCode"]) : false;
            // 实参2 标示app token
            if (constUtil.tokenIsInvalid(errorCode,2)) {
                logger.debug(" req.session.processAppTokenError appToken:" + appToken.access_token);
                if (req.session.refreshingToken) {
                    instance["_process_token_validate"] = true;
                    appAuthRest.globalEmitter.once(constUtil.errors.REFRESH_APP_TOKEN_SUCCESS, function (newToken) {
                        delete instance["_process_token_validate"];
                        // 根据新token重新发送请求
                        logger.debug("Other waited request get new_app_token :" + newToken.access_token);
                        logger.debug("Other waited request url :" + instance.restOptions.method + "  " + instance.restOptions.url);
                        reTryRequest(instance, newToken.access_token, realmId, req, res);
                    });
                } else {
                    retEmitter = tokenProvider.processAppTokenError(errorCode);
                    if (retEmitter["inProcessType"]) {
                        req.session.refreshingToken = true;
                        instance["_process_token_validate"] = true;
                        retEmitter.on(constUtil.errors.REFETCHED_APP_TOKEN, function (newToken) {
                            handleFlag(instance, req);
                            // 将新 token 抛出去
                            appAuthRest.globalEmitter.emit(constUtil.errors.REFRESH_APP_TOKEN_SUCCESS, newToken, req);
                            // 根据新token重新发送请求
                            reTryRequest(instance, newToken.access_token, realmId, req, res);
                        });
                    }
                }
            }
        });
        return instance;
    }
};
/**
 * 设置认证头信息
 */
function setAuthHeader(requestInstance, access_token, realmId) {
    // 1. 将 accessToken 放入请求头中
    requestInstance.setHeader("Authorization", "OAuth2 " + access_token);
    //将realm_id，user_id放入请求头
    requestInstance.setHeader("realm", realmId);
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
function reTryRequest(requestInstance, access_token, realmId, req, res) {
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
    setAuthHeader(requestInstance, access_token, realmId);
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
        return RestlerExtend.prepareRequest.call(baseRest.get(options, req, res), req, res);
    },
    post: function (options, req, res) {
        return RestlerExtend.prepareRequest.call(baseRest.post(options, req, res), req, res);
    },
    put: function (options, req, res) {
        return RestlerExtend.prepareRequest.call(baseRest.put(options, req, res), req, res);
    },
    del: function (options, req, res) {
        return RestlerExtend.prepareRequest.call(baseRest.del(options, req, res), req, res);
    }
};

// 重载 get 方法
appAuthRest.get = baseRequestOverride.get;
// 重载 post 方法
appAuthRest.post = baseRequestOverride.post;
// 重载 put 方法
appAuthRest.put = baseRequestOverride.put;
// 重载 del 方法
appAuthRest.del = baseRequestOverride.del;

appAuthRest.globalEmitter = new EventEmitter();
/**
 * 重新包装好后，再次Exports出去
 *
 * 方法：
 * 1. get
 * 3. post
 * 4. put
 * 5. del
 */
module.exports = appAuthRest;