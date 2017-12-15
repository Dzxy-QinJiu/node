/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
var DesktopLogoutServic = require("../service/desktop-logout-service");
/*
 * logout page handler.
 */
exports.logout = function (req, res) {
    var _req = req;
    var _res = res;
    DesktopLogoutServic.logout(req, res).on("success", function () {
        _req.session.destroy(function () {
            _res.redirect("/login");
        });
    }).on("error", function () {
        //阻止sso的check
        _req.session.stopcheck = "true";
        //删除session的user，但不清除session,为了传递stopcheck，并需要重新登录
        _req.session.user = "";
        _req.session.save(function () {
            _res.redirect("/login");
        });
    });
};