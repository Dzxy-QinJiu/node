/**
 * 权限验证
 */

"use strict";
var path = require("path");
var auth = require(path.join(portal_root_path , "./lib/utils/auth"));
var checkPrivileges = function(passport, requiredPrivilege) {
    return function(req, res, next) {
        // 无需登录的情况下，允许通过
        if (!passport.needLogin) {
            next();
        } else {
            // 未配置权限的情况下，允许通过
            if (!requiredPrivilege || (Array.isArray(requiredPrivilege) && requiredPrivilege.length === 0)) {
                next();
            } else {
                // 包含指定权限的情况下，允许通过
                var currentUserPrivileges = auth.getUser(req).privileges || [];
                var requirePrivilegeArray = Array.isArray(requiredPrivilege) ? requiredPrivilege : [requiredPrivilege];
                if (isContains(currentUserPrivileges, requirePrivilegeArray)) {
                    next();
                } else {
                    res.status(403);
                    res.json('您好像没有足够权限访问所请求的资源哦');
                }
            }
        }
    };
};

/**
 * 检测数组内的元数是否包含另一个数组内的元数
 * @param arrayObj
 * @returns {boolean}
 */
var isContains = function(arrayObj_src, arrayObj_dest) {

    var isExist = false;
    arrayObj_src.some(function(aObj) {
        arrayObj_dest.some(function(bObj) {
            if (aObj === bObj) {
                return (isExist = true);
            }
        });
        if (isExist) {
            return true;
        }
    });
    return isExist;
};

module.exports = checkPrivileges;
