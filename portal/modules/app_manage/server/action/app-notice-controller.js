
"use strict";

var  appNotice = require("../service/app-notice-service");

exports.getAppNoticeList = function(req, res) {
    var application_id = req.query.application_id;
    var page_size = req.query.page_size;
    var page_num = req.query.page_num;

    var queryObj = {
        application_id: application_id,
        page_size: page_size,
        page_num : page_num
    };
    appNotice.getAppNoticeList(req, res, queryObj).on("success", function(data) {
        res.status(200).json(data);
    }).on("error", function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};