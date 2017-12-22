/**
 * 系统通知的action
 */
//联系人的ajax
var NotificationAjax = require("../ajax/notification-ajax");
var notificationEmitter = require("../../../../public/sources/utils/emitters").notificationEmitter;
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
//更新全局未读数
function updateUnread(type, unread) {
    if (Oplate && Oplate.unread) {
        Oplate.unread[type] = unread;
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        timeoutFunc = setTimeout(function () {
            //触发展示的组件未读数的刷新
            notificationEmitter.emit(notificationEmitter.UPDATE_NOTIFICATION_UNREAD);
        }, timeout);
    }
}

function NotificationAction() {

    this.generateActions(
        //获取客户消息列表
        'getCustomerMessageList',
        //重置最后一个消息的id
        'resetLastNotificationId'
    );

    //清除未读数
    this.clearUnreadNum = function (type, callback) {
        let clearTip = Intl.get("notification.clear.unread.failed", "全部标为已读失败！"), error = true;
        NotificationAjax.clearUnreadNum(type).then(data=> {
            if (data) {
                //清除未读数后，更新申请消息/客户提醒的未读数
                updateUnread(type, 0);
                error = false;
                clearTip = Intl.get("notification.clear.unread.success", "全部标为已读成功！");
            }
            if (callback) {
                callback({error: error, clearTip: clearTip});
            }
            this.dispatch(data);
        }, errorMsg=> {
            this.dispatch();
            //重新获取未读数
            if (callback) {
                callback({error: error, clearTip: errorMsg || clearTip});
            }
        });
    };
}

module.exports = alt.createActions(NotificationAction);