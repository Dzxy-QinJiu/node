//通知的action
var NotificationActions = require("../action/notification.action");

//通知的store
function NotificationStore() {
    //表示状态
    this.notificationListResult = "loading";
    //消息列表
    this.notificationList = [];
    //总共多少条
    this.notificationCount = 0;
    //获取失败时的错误信息
    this.notificationErrorMsg = '';
    //一页显示多少条数据
    this.pageSize = 20;
    //读取数据成功后，将会在分页器左边展示loading状态
    this.showLoadingBesidePagination = false;
    //未读数已清
    this.isClearUnreadNum = false;
    //当前列表中最后一个notification的Id
    this.lastNotificationId = "";
    // 下拉加载
    this.listenScrollBottom = true;
    //未读数
    this.unreadNum = 0;
    //绑定action方法
    this.bindActions(NotificationActions);
}
//将最后一个
NotificationStore.prototype.resetLastNotificationId = function () {
    this.lastNotificationId = "";
};
//获取申请消息列表
NotificationStore.prototype.getApplyForMessageList = function (result) {
    if (result.loading) {
        this.notificationListResult = "loading";
        this.notificationErrorMsg = '';
    } else if (result.error) {
        this.notificationListResult = "error";
        this.notificationErrorMsg = result.errorMsg;
        this.notificationList = [];
        this.notificationCount = 0;
        this.showLoadingBesidePagination = false;
    } else {
        this.notificationListResult = "";
        this.notificationErrorMsg = "";
        if (result.data) {
            //未读数
            this.unreadNum = result.data.unread;
            if (_.isArray(result.data.list) && result.data.list.length) {
                if (this.lastNotificationId) {
                    //下拉加载时
                    this.notificationList = this.notificationList.concat(result.data.list);
                } else {
                    //首次获取数据时
                    this.notificationList = result.data.list;
                }
            } else {
                this.notificationList = [];
            }
        }
        this.lastNotificationId = this.notificationList.length ? _.last(this.notificationList).id : "";
        this.notificationCount = result.data.total || this.notificationList.length || 0;
        this.listenScrollBottom = this.notificationCount > this.notificationList.length;
    }
};

// 申请消息的类型
NotificationStore.prototype.handleSelectChange = function () {
    this.lastNotificationId = "";
    this.notificationList = [];
};

// 申请消息的搜索
NotificationStore.prototype.searchEvent = function () {
    this.lastNotificationId = "";
    this.notificationList = [];
};

//获取客户提醒列表
NotificationStore.prototype.getCustomerMessageList = NotificationStore.prototype.getApplyForMessageList;
//清除未读数
NotificationStore.prototype.clearUnreadNum = function (result) {
    if (result) {
        this.isClearUnreadNum = true;
        this.unreadNum = 0;
    } else {
        this.isClearUnreadNum = false;
    }
};
//使用alt导出store
module.exports = alt.createStore(NotificationStore, 'NotificationStore');