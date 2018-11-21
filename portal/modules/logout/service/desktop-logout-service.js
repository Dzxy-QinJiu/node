var restLogger = require('../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);

//定义url
var urls = {
    //登出
    logout: '/auth2/authc/logout',
    //SSO登出
    ssoLogout: '/auth2/authc/sso/logout'
};
//用户Token的前缀
var userTokenPrefix = 'oauth2 ';
//导出url
exports.urls = urls;
/**
 * 调用后端接口进行登录
 * @param req
 * @param res
 */
exports.logout = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.logout,
            req: req,
            res: res,
        }, null);
};
/**
 * 调用后端接口进行SSO登出
 * @param req
 * @param res
 */
exports.ssoLogout = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.ssoLogout,
            req: req,
            res: res
        }, null);
};
/**
 *session超时后退出登录,此时如果从req中取accessToken可能取不到了，所以直接使用从caster推送出来的accessToken
 * @param sessionID
 * @param accessToken
 */
exports.sessionTimeout = function(sessionID, accessToken) {
    var url = urls.ssoLogout + '?only_exit_current=yes';
    return restUtil.baseRest.get(
        {
            url: url,
            req: {sessionID, 'headers': {}},
            res: {},
            headers: {
                Authorization: userTokenPrefix + accessToken
            }
        }, null);
};
