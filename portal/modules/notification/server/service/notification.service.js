var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var EventEmitter = require("events").EventEmitter;
var Promise = require("bluebird");

//通知相关的api
var NotificationRestApis = {
    //获取申请消息列表
    getApplyMessageList: "/rest/base/v1/message/notice/user",
    //获取客户提醒列表
    getCustomerMessageList: "/rest/base/v1/message/notice/customer",
    //清除未读数
    clearUnreadNum: "/rest/base/v1/message/notice/:type/clean",
    //获取客户提醒、申请消息未读数
    getUnreadCount: "/rest/base/v1/message/notice/unread",
    //获取申请的待审批数
    getUnapprovedCount: "/rest/base/v1/message/status/false/0/0"
};
exports.urls = NotificationRestApis;

//获取申请消息列表
exports.getApplyForMessageList = function (req, res, queryObj) {
    return restUtil.authRest.get({
        url: NotificationRestApis.getApplyMessageList,
        req: req,
        res: res
    }, queryObj);
};
//获取客户提醒列表
exports.getCustomerMessageList = function (req, res, queryObj) {
    return restUtil.authRest.get({
        url: NotificationRestApis.getCustomerMessageList,
        req: req,
        res: res
    }, queryObj);
};
//清除未读数
exports.clearUnreadNum = function (req, res, type) {
    return restUtil.authRest.put({
        url: NotificationRestApis.clearUnreadNum.replace(":type", type),
        req: req,
        res: res
    });
};
//获取客户提醒、申请消息未读数和待审批数
exports.getUnreadCount = function (req, res, queryObj) {
    var emitter = new EventEmitter();
    let promiseList = [];
    if (queryObj.type == "unread") {
        //只获取未读数
        promiseList.push(getUnreadInfoCount(req, res));
    } else if (queryObj.type == "unapproved") {
        //只获取待审批数
        promiseList.push(getUnapprovedCount(req, res));
    } else {
        //获取未读数和待审批数
        promiseList.push(getUnreadInfoCount(req, res));
        promiseList.push(getUnapprovedCount(req, res));
    }
    Promise.all(promiseList).then(function (dataList) {
        var unreadObj = {};
        if (queryObj.type == "unread") {
            //只获取未读数
            unreadObj = dataList[0] || {};
        } else if (queryObj.type == "unapproved") {
            //只获取待审批数
            unreadObj.approve = dataList[1] ? dataList[1].total || 0 : 0;
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
        emitter.emit("success", unreadObj);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
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
                success: function (eventEmitter, data) {
                    resolve(data);
                },
                error: function (eventEmitter, errorObj) {
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
                success: function (eventEmitter, data) {
                    resolve(data);
                },
                error: function (eventEmitter, errorObj) {
                    reject(errorObj.message);
                }
            });
    });
};