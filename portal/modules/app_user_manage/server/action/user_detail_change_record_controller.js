/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
"use strict";

var userDetailChangeRecord = require("../service/user_detail_change_record.service");
// 获取用户详情变更记录
exports.getUserDetailChangeRecord = function(req, res) {
    userDetailChangeRecord.getUserChangeRecord(req, res, req.query).on("success", function(data) {
        res.json(data || []);
    }).on("error", function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};