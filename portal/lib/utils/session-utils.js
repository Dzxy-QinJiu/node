/**
 * Session 相关辅助类
 *
 * 用于设置session过期监听事件以及监听到之后的处理
 */

var logoutService = require("../../modules/logout/service/desktop-logout-service");
var sessionLogger = require("./logger").getLogger("session");
var authLogger = require("./logger").getLogger("auth");
var sessionExpireEmitter = require("../../public/sources/utils/emitters").sessionExpireEmitter;

var isStarted = false;

//从auth2退出
function logout(sessionData) {
    var req = {session: sessionData, headers: {}};
    var res = {};

    logoutService.logout(req, res).on("success", function () {
        authLogger.debug("session过期后自动触发从auth2登出, 登出成功");
    }).on("error", function (data) {
        authLogger.error("session过期后自动触发从auth2登出, 登出失败");

        //重试一次
        logoutService.logout(req, res).on("success", function () {
            authLogger.debug("session过期后自动触发从auth2登出, 重试成功");
        }).on("error", function (data) {
            authLogger.error("session过期后自动触发从auth2登出, 重试失败");
        });
    });
}

module.exports = {
    /**
     * 监听 Session 的过期事件
     *
     * @param instance {Hazelcast Node.js Client instance}
     */
    startWatchSessionExpire: function (instance) {
        if (isStarted) return;

        isStarted = true;

        instance.addEntryListener({
            // 自动过期后的回调
            evicted: function (key, value) {
                if (value.data && value.data.user) {
                    sessionLogger.debug("%s 的session在hazelcast中已过期被自动删除", value.data.user && value.data.user.nickname);
                    //logout(value);
                    try{
                        logoutService.sessionTimeout(key,value.data._USER_TOKEN_.access_token);
                    }catch (e){
                        console.log("sessionTimeout error");
                    }
                    //触发session过期的监听事件
                    sessionExpireEmitter.emit(sessionExpireEmitter.SESSION_EXPIRED, {
                        sessionId: key,
                        user: value.data.user
                    });
                }
            }
        }, undefined, true);
    }
};
