/**
 * Created by liwenjun on 2015/3/11.
 */

/**
 * Return the `HazelcastStore` extending `express`'s session Store.
 *
 * @param {object} express session
 * @return {Function}
 * @api public
 */
var util = require('util');
var request = util._extend({}, {'rest': require('request')});
var logger = require('./../utils/logger').getLogger('session');
var noop = function() {
};
module.exports = function(session) {

    /**
     * Express's session Store.
     */

    var Store = session.Store;
    var url = 'http://127.0.0.1/hazelcast/rest/maps/antlog_session/';
    var headers = {'User-Agent': 'Oplate\'s session rest client for nodejs'};

    /**
     * Initialize HazelcastStore with the given `options`.
     *
     * @param {Object} options
     * @api public
     */


    function HazelcastStore(options) {
        options = options || {};
        this.defaultExpirationTime = options.defaultExpirationTime || 10 * 60 * 1000;
        Store.call(this, options);
        this.prefix = options.prefix == null
            ? 'oplate-'
            : options.prefix;

        /* istanbul ignore next */
        this.url = options.url ? options.url : url;
        this.headers = options.headers ? options.headers : headers;
        /**
         * 获取缓存中数据.
         * @param url
         * @param fn
         * @param headers
         * @param doNotRetry  是否重新获取
         */
        function getSessionData(url, sid, fn, headers, doNotRetry) {
            var startTime = Date.now();
            logger.debug('fetching session (url:' + url + ')' + '  headers:' + JSON.stringify(headers));
            var self = this;
            var instance = request.get(url, {
                headers: headers
            });
            instance.on('error', function(err, response) {
                if (doNotRetry) {
                    logger.error('fetch session (id:' + sid + ') has error (httpStatus:%s): ', (response && response.statusCode ? response.statusCode : '未知'), err);
                    return fn && fn(err);
                } else {
                    logger.warn('fetch session (id:' + sid + ') has error (httpStatus:%s), and retry.', (response && response.statusCode ? response.statusCode : '未知'));
                    getSessionData.call(self, url, sid, fn, headers, true);
                }
            }).on('fail', function(err, response) {
                if (doNotRetry) {
                    logger.error('fetch session (id:' + sid + ') is failed (httpStatus:%s): ', (response && response.statusCode ? response.statusCode : '未知'), err);
                    return fn && fn(err);
                } else {
                    logger.warn('fetch session (id:' + sid + ') is failed (httpStatus:%s), and retry.', (response && response.statusCode ? response.statusCode : '未知'));
                    getSessionData.call(self, url, sid, fn, headers, true);
                }
            }).on('success', function(result, response) {
                var elapseTime = Date.now() - startTime;

                if (response.statusCode == 200) {
                    try {
                        logger.debug('fetched session sid(%s) successfully, taking %s s,status:%s,result:%s',
                            sid, elapseTime / 1000, response.statusCode, result);
                        result = JSON.parse(result);
                        if (!result.expires || Date.now() < result.expires) {
                            return fn && fn(null, result.session);
                        } else {
                            self.destroy(sid, fn);
                        }
                    } catch (err) {
                        logger.warn('fetch session (id:' + sid + ') is success, but session data was malformed, so destroy it, reason: ', err);
                        self.destroy(sid, fn);
                        return fn && fn(err);
                    }
                } else if (response.statusCode == 204) {
                    logger.debug('fetched session sid(%s) successfully, taking %s s,status:%s,response:%s',
                        sid, elapseTime / 1000, response.statusCode, JSON.stringify(response));
                    return fn && fn();
                }
            });
        }

        /**
         * Inherit from `Store`.
         */

        HazelcastStore.prototype.__proto__ = Store.prototype;

        /**
         * Attempt to fetch session by the given `sid`.
         *
         * @param {String} sid
         * @param {Function} fn
         * @api public
         */
        HazelcastStore.prototype.get = function(sid, fn) {
            var self = this;
            var psid = self.prefix + sid;
            if (!fn) fn = noop;
            getSessionData.call(self, self.url + psid, sid, fn, self.headers);
        };
        /**
         * 添加数据
         * @param url
         * @param storeObj
         * @param fn
         * @param headers
         * @param doNotRetry  是否重新获取
         */
        function setSessionData(url, sid, storeObj, fn, headers, doNotRetry) {
            var self = this, startTime = Date.now();
            logger.debug('update session (sid:' + sid + ')' + ',  storeObj:' + storeObj + ',headers:' + JSON.stringify(headers));
            var instance = request.post(url, {
                body: storeObj,
                headers: headers
            }).on('error', function(err, response) {
                if (doNotRetry) {
                    logger.error('update session (sid:' + sid + ') has error (httpStatus:%s): ', (response && response.statusCode ? response.statusCode : '未知'), err);
                    return fn && fn(err);
                } else {
                    logger.warn('update session (sid:' + sid + ') has error (httpStatus:%s), and retry.', (response && response.statusCode ? response.statusCode : '未知'));
                    setSessionData.call(self, url, sid, storeObj, fn, headers, true);
                }
            }).on('fail', function(err, response) {
                if (doNotRetry) {
                    logger.error('update session (sid:' + sid + ') is failed (httpStatus:%s): ', (response && response.statusCode ? response.statusCode : '未知'), err);
                    return fn && fn(err);
                } else {
                    logger.warn('update session (sid:' + sid + ') is failed (httpStatus:%s), and retry.', (response && response.statusCode ? response.statusCode : '未知'));
                    setSessionData.call(self, url, sid, storeObj, fn, headers, true);
                }
            }).on('success', function() {
                var elapseTime = Date.now() - startTime;
                logger.debug('update session (sid:%s) successfully! taking %s s', sid, elapseTime / 1000);
                return fn && fn();
            });
        }

        /**
         * Commit the given `sess` object associated with the given `sid`.
         *
         * @param {String} sid
         * @param {Session} sess
         * @param {Function} fn
         * @api public
         */
        HazelcastStore.prototype.set = function(sid, sess, fn) {
            var self = this;
            var psid = self.prefix + sid;
            if (!fn) fn = noop;
            var storeObj = {
                id: psid,
                session: sess
            };
            if (sess && sess.cookie && sess.cookie.expires) {
                storeObj.expires = new Date(sess.cookie.expires).getTime();
            } else {
                storeObj.expires = Date.now() + self.defaultExpirationTime;
            }
            storeObj['expires-hr'] = (new Date(storeObj.expires)).toTimeString();
            try {
                storeObj = JSON.stringify(storeObj);
            } catch (er) {
                return fn(er);
            }
            setSessionData.call(self, self.url + psid, sid, storeObj, fn, self.headers);
        };

        /**
         *  删除数据
         * @param url
         * @param headers
         * @param doNotRetry  是否重新尝试
         */

        function removeSeesionData(url, sid, fn, headers, doNotRetry) {
            var self = this, startTime = Date.now();
            logger.debug('removing session (sid:' + sid + ') , headers:' + JSON.stringify(headers));
            var instance = request.del(url, {
                headers: headers
            }).on('error', function(err, response) {
                if (doNotRetry) {
                    logger.error('remove session (sid:' + sid + ') has error (httpStatus:%s): ', (response && response.statusCode ? response.statusCode : '未知'), err);
                    return fn && fn(err);
                } else {
                    logger.warn('remove session (sid:' + sid + ') has error (httpStatus:%s), and retry.', (response && response.statusCode ? response.statusCode : '未知'));
                    removeSeesionData.call(self, url, sid, fn, headers, true);
                }
            }).on('fail', function(err, response) {
                if (doNotRetry) {
                    logger.error('remove session (sid:' + sid + ') is failed (httpStatus:%s): ', (response && response.statusCode ? response.statusCode : '未知'), err);
                    return fn && fn(err);
                } else {
                    logger.warn('remove session (sid:' + sid + ') is failed (httpStatus:%s), and retry.', (response && response.statusCode ? response.statusCode : '未知'));
                    removeSeesionData.call(self, url, sid, fn, headers, true);
                }
            }).on('success', function() {
                var elapseTime = Date.now() - startTime;
                logger.debug('removed session (sid:%s) successfully! taking %s s', sid, elapseTime / 1000);
                return fn && fn();
            });
        }

        /**
         * Destroy the session associated with the given `sid`.
         *
         * @param {String} sid
         * @api public
         */

        HazelcastStore.prototype.destroy = function(sid, fn) {
            var self = this;
            removeSeesionData.call(self, self.url + self.prefix + sid, sid, fn, self.headers);
        };

        var RequestOverride = {
            baseRequest: function(url, options, method) {
                var startTime = Date.now();
                var instance = request.rest[method](url, options, function(error, response, body) {
                    logger.debug('baseRequest taking %ss', ( Date.now() - startTime) / 1000);
                    if (!error && response) {
                        if (parseInt(response.statusCode) >= 400) {
                            instance.emit('fail', body, response);
                        } else {
                            instance.emit('success', body, response);
                        }
                    }
                });
                return instance;
            },
            get: function(url, options) {
                return RequestOverride.baseRequest(url, options, 'get');
            },
            post: function(url, options) {
                return RequestOverride.baseRequest(url, options, 'post');
            },
            put: function(url, options) {
                return RequestOverride.baseRequest(url, options, 'put');
            },
            del: function(url, options) {
                return RequestOverride.baseRequest(url, options, 'del');
            }
        };
        // 重载 get 方法
        request.get = RequestOverride.get;
        // 重载 post 方法
        request.post = RequestOverride.post;
        // 重载 put 方法
        request.put = RequestOverride.put;
        // 重载 del 方法
        request.del = RequestOverride.del;
    }

    return HazelcastStore;
}
;
