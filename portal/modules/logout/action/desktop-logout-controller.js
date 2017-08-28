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
    DesktopLogoutServic.logout(req, res);
    req.session.destroy(function () {
        res.redirect("/login");
    });
};