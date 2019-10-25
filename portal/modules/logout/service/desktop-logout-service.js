var restLogger = require('../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);

//定义url
var urls = {
    //登出
    logout: '/auth2/authc/logout',
    //SSO登出
    ssoLogout: '/auth2/authc/sso/logout',
    //监听到session超时后，调用业务端的接口退出（此接口处理了node端启多个pod时，调用多次auth2退出接口生成多条退出日志的问题）
    sessionOutLogout: '/rest/open/resource/member/logout',
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
            res: res
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
    // TODO 超时后，由于只退出本应用，在超时界面刷新时，若其他应用未失效时，ssoCheck，会再次登录成功
    // 暂时去掉参数，改为超时后退出所有应用（待思考解决办法）
    // var url = urls.ssoLogout + '?only_exit_current=yes';
    var url = urls.ssoLogout;
    return restUtil.baseRest.get(
        {
            url: url,
            req: {sessionID, 'headers': {}},
            res: {},
            headers: {
                Authorization: userTokenPrefix + accessToken,
                realm: global.config.loginParams.realm
            }
        }, null);
};

/**
 * 调用业务端接口退出（此接口处理了node端启多个pod时，调用多次auth2退出接口生成多条退出日志的问题）
 * @param req
 * @param res
 */
exports.sessionOutLogout = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.sessionOutLogout,
            req: req,
            res: res,
        }, {session_id: req.sessionID});
};