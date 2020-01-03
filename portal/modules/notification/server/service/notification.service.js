var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

//通知相关的api
var NotificationRestApis = {
    //清除未读数
    clearUnreadNum: '/rest/base/v1/message/notice/:type/clean',
    //获取客户提醒、申请消息未读数
    getUnreadCount: '/rest/base/v1/message/notice/unread',
    //获取申请的待审批数
    getUnapprovedCount: '/rest/base/v1/message/applylist/worklist',
    //获取系统消息列表(未处理)
    getUnHandledSystemNotices: '/rest/base/v1/notice/customernotice/grouping',
    //获取系统消息列表(已处理)
    getHandledSystemNotices: '/rest/base/v1/notice/customernotice/history',
    //将系统消息设为已处理
    handleSystemNotice: '/rest/base/v1/notice/customernotice/handle/:noticeId',
    //获取升级公告列表
    getUpgradeNoticeList: '/rest/base/v1/application/upgrade/notice',
};
exports.urls = NotificationRestApis;

//获取升级公告列表
exports.getUpgradeNoticeList = (req, res) => {
    return restUtil.authRest.get({
        url: NotificationRestApis.getUpgradeNoticeList,
        req: req,
        res: res,
    }, req.query);
};

//获取系统消息列表
exports.getSystemNotices = function(req, res, queryObj) {
    let url = NotificationRestApis.getUnHandledSystemNotices;//未处理的系统消息
    if (req.params.status === 'handled') {//已处理
        url = NotificationRestApis.getHandledSystemNotices;
    }
    return restUtil.authRest.get({
        url: url,
        req: req,
        res: res
    }, queryObj);
};
//将系统消息设为已处理
exports.handleSystemNotice = function(req, res, noticeId) {
    return restUtil.authRest.put({
        url: NotificationRestApis.handleSystemNotice.replace(':noticeId', noticeId),
        req: req,
        res: res
    }, null);
};
//清除未读数
exports.clearUnreadNum = function(req, res, type) {
    return restUtil.authRest.put({
        url: NotificationRestApis.clearUnreadNum.replace(':type', type),
        req: req,
        res: res
    });
};
//获取客户提醒、申请消息未读数和待审批数
exports.getUnreadCount = function(req, res, queryObj) {
    var emitter = new EventEmitter();
    let promiseList = [];
    if (queryObj.type === 'unread') {
        //只获取未读数
        promiseList.push(getUnreadInfoCount(req, res));
    } else if (queryObj.type === 'unapproved') {
        //只获取待审批数
        promiseList.push(getUnapprovedCount(req, res));
    } else {
        //获取未读数和待审批数
        promiseList.push(getUnreadInfoCount(req, res));
        promiseList.push(getUnapprovedCount(req, res));
    }
    Promise.all(promiseList).then(function(dataList) {
        var unreadObj = {};
        if (queryObj.type === 'unread') {
            //只获取未读数
            unreadObj = dataList[0] || {};
        } else if (queryObj.type === 'unapproved') {
            //只获取待审批数
            unreadObj.approve = dataList[0] ? dataList[0].total || 0 : 0;
        } else {
            /**
             * dataList
             *[ {customer:2,apply:5}, //getUnreadInfoCount
             *  {data:[],total:15} //getUnapprovedCount
             * ]
             */
            unreadObj = dataList[0] || {};
            unreadObj.approve = dataList[1] ? dataList[1].total || 0 : 0;
        }
        emitter.emit('success', unreadObj);
    }, function(errorMsg) {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};
//获取未读数（申请消息、客户提醒）
function getUnreadInfoCount(req, res) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: NotificationRestApis.getUnreadCount,
                req: req,
                res: res
            }, null, {
                success: function(eventEmitter, data) {
                    resolve(data);
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj.message);
                }
            });
    });
}
//获取申请的未审批数
function getUnapprovedCount(req, res) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: NotificationRestApis.getUnapprovedCount,
                req: req,
                res: res
            }, null, {
                success: function(eventEmitter, data) {
                    resolve(data);
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj.message);
                }
            });
    });
}