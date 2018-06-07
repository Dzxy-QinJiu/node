//通知的action
var NotificationActions = require('../action/notification.action');

//通知的store
function NotificationStore() {
    //表示状态
    this.notificationListResult = 'loading';
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
    this.lastNotificationId = '';
    // 下拉加载
    this.listenScrollBottom = true;
    //未读数
    this.unreadNum = 0;
    //绑定action方法
    this.bindActions(NotificationActions);
}
//将最后一个
NotificationStore.prototype.resetLastNotificationId = function() {
    this.lastNotificationId = '';
};

//清除未读数
NotificationStore.prototype.clearUnreadNum = function(result) {
    if (result) {
        this.isClearUnreadNum = true;
        this.unreadNum = 0;
    } else {
        this.isClearUnreadNum = false;
    }
};
//使用alt导出store
module.exports = alt.createStore(NotificationStore, 'NotificationStore');