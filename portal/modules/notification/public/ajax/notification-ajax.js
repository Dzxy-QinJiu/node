//获取申请消息列表
var messageListAjax;
exports.getApplyForMessageList = function (queryObj) {
    if (messageListAjax) {
        messageListAjax.abort();
    }
    var Deferred = $.Deferred();
    messageListAjax = $.ajax({
        url: '/rest/notification/applyfor',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.message || Intl.get("notification.get.apply.list.failed", "获取申请列表失败"));
            }
        }
    });
    return Deferred.promise();
};
//获取客户提醒列表
var customerListAjax;
exports.getCustomerMessageList = function (queryObj) {
    if (customerListAjax) {
        customerListAjax.abort();
    }
    var Deferred = $.Deferred();
    customerListAjax = $.ajax({
        url: '/rest/notification/customer',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.message || Intl.get("notification.customer.notification.failed", "获取客户提醒列表失败"));
            }
        }
    });
    return Deferred.promise();
};
//清除未读数
exports.clearUnreadNum = function (type) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/notification/unread_num/' + type,
        dataType: 'json',
        type: 'put',
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};