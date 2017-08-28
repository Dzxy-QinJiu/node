/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
"use strict";

var  userAbnormalLogin = require("../service/user_abnormal_login.service");
// 获取用户详情变更记录
exports.getUserAbnormalLogin = function (req, res) {
    userAbnormalLogin.getUserAbnormalLogin(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};