var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
/**
 * restUtil.authRest请求方法参数
 * option {
     *  url {string}
     *  req {obj}
     *  res {obj}
     *  headers: {obj}
     *  form {obj} 用form提交时传入参数
     *  formData {obj} 用formData提交时传入参数
     * },
 * data {obj}, body里的参数
 * callback {
     *    error: function: (eventEmitter, errorCode, restResp)     *    
     *    success: function: (eventEmitter, data, restResp)
     *    timeout: function: (eventEmitter, errorCode)
     * }
 */
exports.bar = function(req, res) {
    return restUtil.authRest.get({
        url: '',
        req: req,
        res: res
    }, {});
};
exports.foo = function(req, res) {
    return restUtil.authRest.post({
        url: '',
        req: req,
        res: res
    }, {});
};
exports.func = function(req, res) {
    return restUtil.authRest.del({
        url: '',
        req: req,
        res: res
    }, {});
};
exports.fun = function(req, res) {
    return restUtil.authRest.put({
        url: '',
        req: req,
        res: res
    }, {});
};
    