/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/3/20.
 */
const errors = {
    GLOBAL_ERROR: "global-error",//全局错误
    LOGIN_ONLY_ONE: "login-only-one",//被他人踢出，不允许多人登录
    KICKED_BY_ADMIN: "kicked-by-admin",//被管理员踢出
    TOKEN_NOT_EXIST: "token-not-exist",//token不存在
    TOKEN_EXPIRED: "token-expired",//token过期
    TOKEN_KICKED_BY_SSO: "token-kicked-by-sso",//被sso 服务踢出
    REFRESH_TOKEN_ERROR: "refresh-token-error",//刷新token失败
    REFRESH_TOKEN_SUCCESS: "after-token-refresh-successful",//刷新token成功
    REFETCHED_APP_TOKEN: "app-token-refetched",//重新获取到app token
    REFRESH_APP_TOKEN_SUCCESS: "after-get-appToken-successful",//刷新应用token成功
}
/**
 * 通用token 错误码
 *   11484 被管理员踢出
 *  11485 该token已登出 (主动登出)
 */
var commonErrorCodeMessageMap = {
    11484: errors.KICKED_BY_ADMIN,
    11485: errors.TOKEN_NOT_EXIST,
}
/**
 *  app token错误码与错误类型字符串的映射
 *  11011  Token不存在
 *  11012 Token过期
 */

var appTokenErrorCodeMessageMap = {
    11011: errors.TOKEN_NOT_EXIST,
    11012: errors.TOKEN_EXPIRED,
};
/**
 *  用户token错误码与错误类型字符串的映射
 *  11473 token 被单点退出;
 *  19300 token 过期
 *  19302 拦截 token 不存在;
 *  19301 被他人踢出 ;
 */

var userTokenErrorCodeMessageMap = {
    11473: errors.TOKEN_KICKED_BY_SSO,
    19300: errors.TOKEN_EXPIRED,
    19301: errors.LOGIN_ONLY_ONE,
    19302: errors.TOKEN_NOT_EXIST,
};
/**
 * 根据错误码判断token是否是无效的
 * @param errorCode  错误码
 * @param type  映射关系类型，1：标示用户token，2：标示应用token
 * @returns {boolean}
 */
function tokenIsInvalid(errorCode, type) {
    //默认不包含
    var isContains = false;
    if (errorCode) {
        //用户访问token
        if (type == 1) {
            isContains = containsCode(userTokenErrorCodeMessageMap, errorCode)
        } else if (type == 2) {
            //应用token
            isContains = containsCode(appTokenErrorCodeMessageMap, errorCode)
        }
        //如果不存在用户或应用token错误码映射中，再判断是否再通用映射中
        if (!isContains) {
            isContains = containsCode(commonErrorCodeMessageMap, errorCode)
        }
    }
    return isContains;
}
/**
 *  对象是否包含某个key
 * @param map  错误码与描述映射对象
 * @param errorCode 错误码
 * @returns {boolean}
 */
function containsCode(map, errorCode) {
    if (typeof map == "object") {
        for (var key in map) {
            if (key == errorCode) {
                return true;
            }
        }
    }
    return false;
}
exports.errors = errors;
exports.commonErrorCodeMessageMap = commonErrorCodeMessageMap;
exports.userTokenErrorCodeMessageMap = userTokenErrorCodeMessageMap;
exports.appTokenErrorCodeMessageMap = appTokenErrorCodeMessageMap;
exports.tokenIsInvalid = tokenIsInvalid;