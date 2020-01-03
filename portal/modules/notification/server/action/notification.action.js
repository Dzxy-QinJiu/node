/**
 * @author zhoulianyi
 * @date   2016-05-20
 *         通知相关的rest请求
 */



var NotificationService = require('../service/notification.service');

// 升级公告
exports.getUpgradeNoticeList = (req, res) => {
    NotificationService.getUpgradeNoticeList(req, res).on('success', (data) => {
        res.json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//清除未读数
exports.clearUnreadNum = function(req, res) {
    NotificationService.clearUnreadNum(req, res, req.params.type).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取系统消息列表
exports.getSystemNotices = function(req, res) {
    NotificationService.getSystemNotices(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//将系统消息设为已处理
exports.handleSystemNotice = function(req, res) {
    NotificationService.handleSystemNotice(req, res, req.params.noticeId).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取客户提醒、申请消息未读数
exports.getUnreadCount = function(req, res) {
    NotificationService.getUnreadCount(req, res, req.query).on('success', function(data) {
        res.json(data);
    }).on('error', function(ret) {
        res.status(500).json(ret);
    });
};