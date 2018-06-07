var appAjaxTrans = require('../../../../modules/common/public/ajax/app');
// 获取应用列表
exports.getAppList = function() {
    var Deferred = $.Deferred();
    appAjaxTrans.getGrantApplicationListAjax().sendRequest().
        success((list) => {
            Deferred.resolve(list);
        }).error((xhr, code , errText) => {
            Deferred.reject();
        }).timeout(function() {
            Deferred.reject();
        });
    return Deferred.promise();
};


// 获取在前在线用户总数
var onlineUserListAjax;
exports.getOnlineUserList = (pageSize, pageNum, condition) => {
    var Deferred = $.Deferred();
    onlineUserListAjax && onlineUserListAjax.abort();
    onlineUserListAjax = $.ajax({
        url: '/rest/online/list/' + pageSize + '/' + pageNum,
        dataType: 'json',
        type: 'post',
        success: (data) => {
            Deferred.resolve(data);
        },
        data: condition,
        error: (xhr,statusText) => {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//获取今日上线的用户数
var recentLoginUsersAjax = null;
exports.getRecentLoginUsers = (params) => {
    var Deferred = $.Deferred();
    if(recentLoginUsersAjax) {
        recentLoginUsersAjax.abort();
    }
    recentLoginUsersAjax = $.ajax({
        url: '/rest/recent/login/users',
        dataType: 'json',
        type: 'get',
        data: params,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr , textStatus) => {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.list.get.failed', '获取用户列表失败'));
            }
        }
    });
    return Deferred.promise();
};

// 获取用户总数（试用、签约）
let userTypeStatisticsAjax;
exports.getUserTypeStatistics = (dataType,obj) => {
    userTypeStatisticsAjax && userTypeStatisticsAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    userTypeStatisticsAjax = $.ajax({
        url: `/rest/analysis/user/${dataType}/type`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,textStatus) => {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 新增用户类型（试用、签约）
let userTypeNewStatisticsAjax;
exports.getAddedUserTypeStatistics = (dataType,obj) => {
    userTypeNewStatisticsAjax && userTypeNewStatisticsAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    userTypeNewStatisticsAjax = $.ajax({
        url: `/rest/new/user/${dataType}/type`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,textStatus) => {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取用户活跃度统计
exports.getUserActiveNess = (dataType,dateRange,obj) => {
    obj = obj || {};
    var Deferred = $.Deferred();
    $.ajax({
        url: `/rest/analysis/user/activeness/${dataType}/${dateRange}`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,textStatus) => {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增用户的团队统计
var addedTeamAjax;
exports.getAddedTeam = (obj) => {
    addedTeamAjax && addedTeamAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedTeamAjax = $.ajax({
        url: '/rest/new/user/team',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,textStatus) => {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 获取新增用户的地域统计
var addedZoneAjax;
exports.getAddedZone = (obj) => {
    addedZoneAjax && addedZoneAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedZoneAjax = $.ajax({
        url: '/rest/analysis/user/added/zone',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,textStatus) => {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 获取当前应用的在线用户的地域数据
var OnLineUserZoneAjax;
exports.getOnLineUserZone = (obj) => {
    OnLineUserZoneAjax && OnLineUserZoneAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    OnLineUserZoneAjax = $.ajax({
        url: '/rest/user/online/zone',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,textStatus) => {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取全部用户的的地域统计（只包含启用的应用）
var totalZoneAjax;
exports.getTotalZone = (obj) => {
    totalZoneAjax && totalZoneAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    totalZoneAjax = $.ajax({
        url: '/rest/analysis/user/total/zone',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr,textStatus) => {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
