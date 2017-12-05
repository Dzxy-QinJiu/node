/**
 * @author zhoulianyi
 * @date   2016-05-20
 *         通知相关的rest请求
 */



var NotificationService = require("../service/notification.service");

//清除未读数
exports.clearUnreadNum = function (req, res) {
    NotificationService.clearUnreadNum(req, res, req.params.type).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取客户提醒列表
exports.getCustomerMessageList = function (req, res) {
    let queryObj = {
        is_consumed: req.query.is_consumed || "all",
        page_size: req.query.page_size || '10'
    };
    if (req.query.id) {
        queryObj.id = req.query.id;
    }
    if (req.query.keyword) {
        queryObj.keyword = req.query.keyword;
    }
    NotificationService.getCustomerMessageList(req, res, queryObj).on("success", function (data) {
        res.json(data);
    }).on("error", function (ret) {
        res.status(500).json(ret);
    });
};

//获取系统消息列表
exports.getSystemNotices = function (req, res) {
    NotificationService.getSystemNotices(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//将系统消息设为已处理
exports.handleSystemNotice = function (req, res) {
    NotificationService.handleSystemNotice(req, res, req.params.noticeId).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取客户提醒、申请消息未读数
exports.getUnreadCount = function (req, res) {
    NotificationService.getUnreadCount(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (ret) {
        res.status(500).json(ret);
    });
};