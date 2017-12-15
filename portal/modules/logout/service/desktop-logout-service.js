var restLogger = require("../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../lib/rest/rest-util")(restLogger);
var request = require("request");
var config = require('../../../../conf/config');
var ipUtil = require('../../../lib/utils/common-utils').ip;
var auth = require("../../../lib/utils/auth");

//定义url
var urls = {
    //登出
    logout: "/auth2/authc/sso/logout"
};
//用户Token的前缀
var userTokenPrefix = "oauth2 ";
//导出url
exports.urls = urls;

/**
 * 调用后端接口进行登出
 * @param req
 * @param res
 */
exports.logout = function (req, res) {
    return restUtil.authRest.get(
        {
            url: urls.logout,
            req: req,
            res: res
        }, null);
};
//session超时后退出sso登录
exports.sessionTimeout = function (sessionID, accessToken) {
    var url = urls.logout + "?only_exit_current=yes";
    var ipsObj = getIps(req);
    ipsObj.userIp = ipsObj.userIp || "127.0.0.1";
    return restUtil.baseRest.get(
        {
            url: url,
            req: {sessionID},
            res: {},
            headers: {
                remote_addr: ipsObj.serverIp,
                user_ip: ipsObj.userIp,
                Authorization: userTokenPrefix + accessToken
            }
        }, null);
}

//获取用户Ip和服务端Ip
function getIps(req) {
    var ipsObj = {
        userIp: ipUtil.getClientIp(req) || "",//用户IP
        serverIp: ""
    };
    //获取服务端Ip
    var serverIps = ipUtil.getServerAddresses();
    if (serverIps && serverIps.length > 0) {
        ipsObj.serverIp = serverIps[0] || "";
    }
    return ipsObj;
}

