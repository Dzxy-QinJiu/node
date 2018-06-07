var appAjax = require('../../../common/public/ajax/app');

//获取在线用户列表
var onlineUserListAjax;
exports.getOnlineUserList = function(pageSize, pageNum, condition) {
    var Deferred = $.Deferred();
    onlineUserListAjax && onlineUserListAjax.abort();
    onlineUserListAjax = $.ajax({
        url: '/rest/online/list/' + pageSize + '/' + pageNum,
        dataType: 'json',
        type: 'post',
        success: function(data) {
            Deferred.resolve(data);
        },
        data: condition,
        error: function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//获取应用列表
exports.getAppList = function() {
    var Deferred = $.Deferred();
    appAjax.getGrantApplicationListAjax().
        sendRequest().success(function(appList) {
            Deferred.resolve(appList);
        }).error(function(xhr) {
            Deferred.reject(xhr.responseJSON);
        });
    return Deferred.promise();
};

// 踢出用户下线
exports.kickUser = function(ids){
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/online/kick_user',
        dataType: 'json',
        type: 'post',
        data: {ids: JSON.stringify(ids)},
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

