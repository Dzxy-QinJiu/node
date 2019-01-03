/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/12.
 */
'use strict';

var phoneAlertService = require('../service/phone-alert-service');

//增加应用反馈
exports.addAppFeedback = function(req, res) {
    phoneAlertService.addAppFeedback(req, res, req.body).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage);
    });
};
