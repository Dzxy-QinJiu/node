
//获取系统通知
let systemNoticesAjax;
exports.getSystemNotices = function(queryObj, status) {
    if (systemNoticesAjax) {
        systemNoticesAjax.abort();
    }
    var Deferred = $.Deferred();
    systemNoticesAjax = $.ajax({
        url: `/rest/notification/system/${status}`,
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON || Intl.get('notification.system.notice.failed', '获取系统消息列表失败'));
            }
        }
    });
    return Deferred.promise();
};
//系统消息
let handleSystemNoticeAjax;
exports.handleSystemNotice = function(noticeId) {
    if (handleSystemNoticeAjax) {
        handleSystemNoticeAjax.abort();
    }
    var Deferred = $.Deferred();
    handleSystemNoticeAjax = $.ajax({
        url: `/rest/notification/system/handle/${noticeId}`,
        dataType: 'json',
        type: 'put',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON );
            }
        }
    });
    return Deferred.promise();
};

//清除未读数
exports.clearUnreadNum = function(type) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/notification/unread_num/' + type,
        dataType: 'json',
        type: 'put',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 升级公告
let upgradeNoticeAjax;
exports.getUpgradeNoticeList = (queryObj) => {
    if (upgradeNoticeAjax) {
        upgradeNoticeAjax.abort();
    }
    const Deferred = $.Deferred();
    upgradeNoticeAjax = $.ajax({
        url: '/rest/get/upgrade/notice',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (error, errorText) => {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON || Intl.get('notification.system.notice.failed', '获取公告列表失败'));
            }
        }
    });
    return Deferred.promise();
};