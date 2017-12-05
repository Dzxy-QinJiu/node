/**
 * Created by liwenjun on 2015/12/23.
 */
var util = require("util");
var request = util._extend({}, {"request": require('request')});
var restLogger = require("./../utils/logger").getLogger('rest');
var config = require("../../../conf/config");
var _ = require("underscore");
const Metric = require("./../utils/metric-util");
const extend = require("extend");
//外部添加的头信息
var customGlobalHeaders = null;
//替换为6个星号
const starStrings = "******";
//需要替换的key
const needReplaceKey = ["client_id", "client_secret", "Authorization", "realm", "password"];
var RequestOverride = {
    /**
     * 重新整理 options 参数
     *
     * @param options {object} 修改前的 options
     * @param method {string}  请求方法类型（GET，POST）
     * @param req {object}     浏览器的请求对象
     * @param res {object}     浏览器的响应对象
     * @returns {object}       返回修改后的 options
     */
    shortcutOptions: function (options, method, req, res) {
        options = options || {};
        options.method = method;
        if (!(typeof options.json === 'boolean' && options.json)) {
            delete options.json;
        }
        //设置数据类型
        options.json = (typeof options.json !== "undefined") ? options.json : config.restJson;
        // 设定超时机制
        options.timeout = options.timeout || config.restTimeout;
        options.timeout = Number.isFinite(options.timeout) ? options.timeout : 3 * 60 * 1000;
        //清理空数据
        if (typeof options.qs == 'object') {
            Object.keys(options.qs).forEach(function (key) {
                if (options.qs[key] === undefined || options.qs[key] === null || (typeof options.qs[key] == 'number' && isNaN(options.qs[key]))) {
                    delete options.qs[key];
                }
            });
        }
        if (typeof options.body == 'object') {
            Object.keys(options.body).forEach(function (key) {
                if (options.body[key] === undefined || options.body[key] === null || (typeof options.body[key] == 'number' && isNaN(options.body[key]))) {
                    delete options.body[key];
                }
            });
        }

        if (!options.headers || !options.headers["User-Agent"]) {
            options.headers = options.headers || {};
            options.headers["User-Agent"] = "Rest client for oplate nodejs";
        }
        if (customGlobalHeaders) {
            Object.keys(customGlobalHeaders).forEach(function (key) {
                if (typeof customGlobalHeaders[key] === "function") {
                    options.headers[key] = customGlobalHeaders[key](options, method, req);
                } else {
                    options.headers[key] = customGlobalHeaders[key];
                }
            });
        }
        //打印参数日志
        if (config.logLevel == "DEBUG") {
            //替换或隐藏部分字符
            var params = hideString(extend(true, {}, options));
            restLogger.debug("sessionID: " + (req && req.sessionID) + ",request params:", JSON.stringify(params));
        }
        return options;
    },
    /**
     * 基本的请求函数(加上请求成功所花费的时间日志)
     * @param options
     * @param req
     * @param res
     * @param method
     * @returns {*}
     */
    baseRequest: function (options, req, res, method) {
        var elapseTime, startTime = Date.now();
        var restOptions = RequestOverride.shortcutOptions(options, method.toUpperCase(), req, res);
        var instance = null;
        var sid = req && req.sessionID;

        function callback(error, response, body) {
            //成功返回数据时，按状态码分别处理；错误时，将进入对error的监听处理
            if (!error && response) {
                if (parseInt(response.statusCode) >= 400) {
                    instance.emit('fail', body, response);
                } else {
                    instance.emit('success', body, response);
                }
            } else {
                if (!instance) {
                    //请求实例不存在，记录错误信息
                    restLogger.error("sessionID: " + sid + ",request url(%s) error: %s", restOptions.url, error.message);
                }
            }
        };
        //使用服务网关的地址
        restOptions.url = handelPath(restOptions.url, config.gateway);
        instance = request.request(restOptions, callback);
        //上传文件
        if (restOptions['pipe-upload-file']) {
            req.pipe(instance);
        } else if (restOptions['pipe-download-file']) {
            //下载文件
            instance.pipe(res);
        }
        //记录原始options,用于重新请求数据;
        instance.restOptions = restOptions;

        instance.on("success", function () {
            elapseTime = Date.now() - startTime;
            if (elapseTime > 0) {
                var spendTime = elapseTime / 1000;
                restLogger.info("sessionID: " + sid + ",request url(%s) taking %ss", options.url, spendTime);
                //正式环境发送度量数据
                if (config && config.formal == "true" && config.metricAddress) {
                    const metric = new Metric(config.metricAddress);
                    metric.sendMetrics({
                        app: config.processTitle || "myapp",
                        path: options.url,
                        sessionID: sid,
                        method: options.method,
                        spendTime: spendTime
                    });
                }
            }
        });
        return instance;
    },

    get: function (options, req, res) {
        return RequestOverride.baseRequest(options, req, res, "GET");
    },
    post: function (options, req, res) {
        return RequestOverride.baseRequest(options, req, res, "POST");
    },
    put: function (options, req, res) {
        return RequestOverride.baseRequest(options, req, res, "PUT");
    },
    del: function (options, req, res) {
        return RequestOverride.baseRequest(options, req, res, "DELETE");
    }
};

/**
 * 向外暴露一个添加自定义请求头的方法
 * @param key {string}
 * @param val {string|function} function: val(req)
 */
request.addCustomGlobalHeader = function (key, val) {
    if (val && (typeof val === "string" || typeof val === "function")) {
        if (!customGlobalHeaders) {
            customGlobalHeaders = {};
        }
        customGlobalHeaders[key] = val;
    }
};
/**
 * 获取路径。
 *  1.url是全路径，即以http://或https://开头时，直接返回；
 *  2.url以"/"开头时，在url前添加协议地址和端口；
 *  3.url非前两种时，先在url前添加加“/”，再添加协议地址和端口，然后；
 * @param url
 * @param serviceUrl   不同的rest服务器地址。
 * @returns {*}
 */
function handelPath(url, serviceUrl) {
    //如果url存在且为string
    if (url && typeof url === "string") {
        //不是全路径
        if (url.indexOf("http://") != 0 && url.indexOf("https://") != 0) {
            //不是以"/"开头
            if ((url.indexOf("/") != 0)) {
                url = "/" + url;
            }
            //serviceUrl存在，就使用服务地址；否则用配置文件中的地址
            if (serviceUrl != null) {
                url = serviceUrl + url;
            } else {
                var proxy = userDefaultPath();
                url = proxy.protocal + proxy.host + ":" + proxy.port + url;
            }
        }
        return url;
    } else {
        return url;
    }
};
/**
 * 使用缺省路径
 */
function userDefaultPath() {
    //默认值
    var proxy = {
        protocal: "http://",
        host: "127.0.0.1",
        port: "9191"
    };
    //合并config中的协议地址端口
    if (config && util.isObject(config.proxy)) {
        var keys = Object.keys(config.proxy);
        var i = keys.length;
        while (i--) {
            if (config.proxy[keys[i]]) {
                proxy[keys[i]] = config.proxy[keys[i]];
            }
        }
    }
    return proxy;
}
/**
 * 隐藏密码及auth2相关的id和秘钥等字符
 * @param params
 * @returns {*}
 */
function hideString(params) {
    if (_.isObject(params)) {
        _.each(params, function (value, key) {
            if (key === "formData") {
                //如果是formData直接删除
                delete params[key];
            } else {
                if (_.isObject(value)) {
                    //如果value是对象，递归调用hideString
                    hideString(value);
                } else {
                    if (needReplaceKey.indexOf(key) != -1) {
                        //如果key是password时，直接替换为星号
                        if (key === "password") {
                            params[key] = starStrings;
                        } else {
                            //其他的隐藏部分字符
                            params[key] = replacePartialString(value);
                        }
                    }
                }
            }
        });
    }
    return params;
}
/**
 * 替换部分字符串
 * @param idOrCode
 * @returns {*}
 */
function replacePartialString(idOrCode) {
    if (_.isNumber(idOrCode)) {
        idOrCode = idOrCode.toString();
    }
    if (_.isString(idOrCode)) {
        var len = idOrCode.length;
        if (len > 16) {
            //大于16个字符时,保留前7个(auth2需要加"oauth2 "7个字符)及后4个字符
            return idOrCode.replace(/(.{7})(.+)(.{4})/g, "$1" + starStrings + "$3");
        } else if (len <= 16 && len >= 8) {
            //在8-16字符之间时,保留前后各2个字符
            return idOrCode.replace(/(.{2})(.+)(.{2})/g, "$1" + starStrings + "$3");
        } else if (len >= 4) {
            //在4-7个字符之间时,保留前后各1个字符
            return idOrCode.replace(/(.)(.+)(.)/g, "$1" + starStrings + "$3");
        } else {
            //小于3个字符直接替换为starStrings
            return starStrings;
        }
    } else {
        return idOrCode;
    }
}
// 重载 get 方法
request.get = RequestOverride.get;
// 重载 post 方法
request.post = RequestOverride.post;
// 重载 put 方法
request.put = RequestOverride.put;
// 重载 del 方法
request.del = RequestOverride.del;

/**
 * 重新包装好后，再次Exports出去
 */
module.exports = request;