/**
 * @author zhoulianyi
 * @date   2016-05-20
 *         通知相关的rest请求
 */



var NotificationService = require('../service/notification.service');

// 升级公告
exports.getUpgradeNoticeList = (req, res) => {
    NotificationService.getUpgradeNoticeList(req, res).on('success', (data) => {
        res.json({total: 1, list: [{
            application_id: '3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9',
            content: '尊敬的用户，你好！产品运营团队于12月27日晚上20:00到22:00对系统进行勿扰升级。升级内容如下:（1）添加书签与书签定位：因故中断监测工作时，标记当前的阅读位置，恢复监测工作时，从标记的位置继续。（2）优化主题操作体验：缺省收起部分操作。（3）优化博文操作体验：缺省收起部分操作；记住上次的“更多”操作。感谢你的理解和支持，我们一直在努力提供更优质的服务。',
            create_date: 1577690943925,
            id: '3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9_1577690943925',
            log_type: 'appnoticelog',
            operator: 'wangyan@curtao.com',
            type: 'upgrade-notice',
        }]});
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