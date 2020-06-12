/**
 * 全局rest请求处理。
 * Created by liwenjun on 2015/12/25.
 */
var userAuthRestEmitter = require('ant-auth-request').userAuthRestEmitter;
var auth = require('../lib/utils/auth');
var _ = require('lodash');
var errors = require('ant-auth-request').constUtilErrors;
//发送到界面的错误信息
var UI_CONST = require('../lib/utils/request-error-util');
var logoutMsgEmitter = require('../../portal/lib/utils/server-emitters').logoutMsgEmitter;
/**
 * 返回403错误信息
 * @param req
 * @param res
 * @param data  发送到界面的数据
 */
function cleanAuthAndSendData(req, res, data) {
    try {
        //发送退出事件给chrome extension插件
        logoutMsgEmitter.emit(logoutMsgEmitter.LOGOUT_ACCOUNT,{
            sessionId: req.sessionID,
            user: req.session.user
        });
        logoutMsgEmitter.emit(logoutMsgEmitter.KICKOFF_ACCOUNT,{
            sessionId: req.sessionID,
            user: req.session.user,
            data: data
        });
        res.status(403).end();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
}
//添加全局请求头
//restManage.baseRest.addCustomGlobalHeader("test", "testvalue");

userAuthRestEmitter.on('timeout', function(req, res, data) {//rest请求超时
    res.status(data.httpCode).json(data.message);
}).on(errors.REFRESH_TOKEN_SUCCESS, function(newToken, userBaseInfo, req) {//刷新token成功
    //复制一份用户数据
    var user = _.clone(userBaseInfo);
    user.auth.access_token = newToken.access_token;
    user.auth.refresh_token = newToken.refresh_token;
    auth.saveUserInfo(req, user);
}).on(errors.GLOBAL_ERROR, function(req, res, error) {//error 标示不同的错误类型
    if (error === errors.LOGIN_ONLY_ONE) {
        cleanAuthAndSendData(req, res, UI_CONST.LOGIN_ONLY_ONE);//被他人踢出，只允许1人登录时
    } else if (error === errors.KICKED_BY_ADMIN) {
        cleanAuthAndSendData(req, res, UI_CONST.KICKED_BY_ADMIN);//被管理员踢出
    } else {
        cleanAuthAndSendData(req, res, UI_CONST.TOKEN_EXPIRED);//刷新token失败,token过期，token不存在，或已退出
    }
});

