/**
 * 全局rest请求处理。
 * Created by liwenjun on 2015/12/25.
 */
var restManage = require("../lib/rest/rest-manage");
var auth = require("../lib/utils/auth");
var _ = require("underscore");
var tokenExpired = "Token过期";

//添加全局请求头
//restManage.baseRest.addCustomGlobalHeader("test", "testvalue");

//rest请求超时
restManage.userAuthRest.globalEmitter.on("timeout", function (req, res, data) {
    res.status(data.httpCode).json(data.message);
});
//token 失效
restManage.userAuthRest.globalEmitter.on("token-expired", function (req, res, data) {
    //清理lisession，并返回403错误信息
    auth.clean(req, res).then(function () {
        res.status(403).json(tokenExpired);
    });
});
//刷新token成功
restManage.userAuthRest.globalEmitter.on("after-token-refresh-successful", function (newToken, userBaseInfo, req) {
    //复制一份用户数据
    var user = _.clone(userBaseInfo);
    user.auth.access_token = newToken.access_token;
    user.auth.refresh_token = newToken.refresh_token;
    auth.saveUserInfo(req, user);
});
//不允许多人登录的踢出
restManage.userAuthRest.globalEmitter.on("login-only-one", function (req, res) {
    res.status(403).json("login-only-one-error");
});
//token 相关处理
restManage.userAuthRest.globalEmitter.on("refresh-token-error", function (req, res) {
    //清理lisession，并返回403错误信息
    auth.clean(req, res).then(function () {
        res.status(403).json(tokenExpired);
    });
}).on("token-not-exist", function (req, res) {
    auth.clean(req, res).then(function () {
        res.status(403).json(tokenExpired);
    });
})