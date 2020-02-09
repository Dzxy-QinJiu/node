/**
 * Session 相关辅助类
 *
 * 用于设置session过期监听事件以及监听到之后的处理
 */

var logoutService = require('../../modules/logout/service/desktop-logout-service');
var sessionLogger = require('./logger').getLogger('session');
var authLogger = require('./logger').getLogger('auth');
var sessionExpireEmitter = require('../utils/server-emitters').sessionExpireEmitter;
var config = require('../../../conf/config');
var isStarted = false;

//从auth2退出
function logout(sessionID, session) {
    var req = {
        sessionID,
        session,
        headers: {
            'user-agent': session.clientInfo.UserAgent || {},
            'user_ip': session.clientInfo.ip || '',
        }
    };
    var res = {};
    logoutService.sessionOutLogout(req, res).on('success', function() {
        authLogger.debug('session过期后自动触发从auth2登出, 登出成功');
    }).on('error', function(data) {
        authLogger.error('session过期后自动触发从auth2登出, 登出失败');
    });
}

module.exports = {
    /**
     * 监听 Session 的过期事件
     *
     * @param instance {Hazelcast Node.js Client instance}
     */
    startWatchSessionExpire: function(instance) {
        if (isStarted) return;
        isStarted = true;
        instance.addEntryListener({
            // 自动过期后的回调
            evicted: function(key, value) {
                if (value.data && value.data.user) {
                    sessionLogger.debug('%s 的session: %s 在hazelcast中已过期被自动删除', value.data.user && value.data.user.nickname, key);
                    if (config.useSso) {
                        //hazelcast中session已过期时，不仅会被自动删除,还会自动退出当前应用的sso登录状态
                        //所以不需要再手动调用退出sso的接口了，不然会报token不存在错误
                        sessionLogger.debug('%s 自动退出当前应用的sso登录状态', value.data.user && value.data.user.nickname);
                        /*try {
                            logoutService.sessionTimeout(key, value.data._USER_TOKEN_.access_token);
                        } catch (e) {
                            sessionLogger.debug('sessionTimeout error');
                        }*/
                    } else {
                        logout(key, value.data);
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
