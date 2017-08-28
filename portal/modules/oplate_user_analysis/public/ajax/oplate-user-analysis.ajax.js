//获取 统计数字（总用户、新增用户、过期用户、新增过期用户）
var summaryNumbersAjax;
exports.getSummaryNumbers = function(obj) {
    summaryNumbersAjax && summaryNumbersAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    summaryNumbersAjax = $.ajax({
        url: '/rest/analysis/user/summary',
        dataType: 'json',
        timeout: 180 * 1000,
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取总用户的用户统计（此处接口没变，显示的用户统计的数据，在total条件下）
var totalSummaryAjax;
exports.getTotalSummary = function(obj) {
    totalSummaryAjax && totalSummaryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    totalSummaryAjax = $.ajax({
        url: '/rest/analysis/user/total/summary',
        dataType: 'json',
        timeout: 180 * 1000,
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增用户的用户统计
var addedSummaryAjax;
exports.getAddedSummary = function(obj) {
    addedSummaryAjax && addedSummaryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedSummaryAjax = $.ajax({
        url: '/rest/analysis/user/added/summary',
        dataType: 'json',
        type: 'get',
        timeout: 180 * 1000,
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取过期用户的用户统计
var expiredSummaryAjax;
exports.getExpiredSummary = function(obj) {
    expiredSummaryAjax && expiredSummaryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    expiredSummaryAjax = $.ajax({
        url: '/rest/analysis/user/expired/summary',
        dataType: 'json',
        type: 'get',
        timeout: 180 * 1000,
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增过期用户的用户统计
var addedExpiredSummaryAjax;
exports.getAddedExpiredSummary = function(obj) {
    addedExpiredSummaryAjax && addedExpiredSummaryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedExpiredSummaryAjax = $.ajax({
        url: '/rest/analysis/user/added_expired/summary',
        dataType: 'json',
        type: 'get',
        timeout: 180 * 1000,
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取总用户的团队统计(单个应用下)
var totalTeamAjax;
exports.getTotalTeam = function(obj) {
    totalTeamAjax && totalTeamAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    totalTeamAjax = $.ajax({
        url: '/rest/analysis/user/total/team',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增用户的团队统计
var addedTeamAjax;
exports.getAddedTeam = function(obj) {
    addedTeamAjax && addedTeamAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedTeamAjax = $.ajax({
        url: '/rest/analysis/user/added/team',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取过期用户的团队统计
var expiredTeamAjax;
exports.getExpiredTeam = function(obj) {
    expiredTeamAjax && expiredTeamAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    expiredTeamAjax = $.ajax({
        url: '/rest/analysis/user/expired/team',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增过期用户的团队统计
var addedExpiredTeamAjax;
exports.getAddedExpiredTeam = function(obj) {
    addedExpiredTeamAjax && addedExpiredTeamAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedExpiredTeamAjax = $.ajax({
        url: '/rest/analysis/user/added_expired/team',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取总用户的地域统计
var totalZoneAjax;
exports.getTotalZone = function(obj) {
    totalZoneAjax && totalZoneAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    totalZoneAjax = $.ajax({
        url: '/rest/analysis/user/total/zone',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 获取新增用户的地域统计
var addedZoneAjax;
exports.getAddedZone = function(obj) {
    addedZoneAjax && addedZoneAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedZoneAjax = $.ajax({
        url: '/rest/analysis/user/added/zone',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取过期用户的地域统计
var expiredZoneAjax;
exports.getExpiredZone = function(obj) {
    expiredZoneAjax && expiredZoneAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    expiredZoneAjax = $.ajax({
        url: '/rest/analysis/user/expired/zone',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增过期用户的地域统计
var addedExpiredZoneAjax;
exports.getAddedExpiredZone = function(obj) {
    addedExpiredZoneAjax && addedExpiredZoneAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedExpiredZoneAjax = $.ajax({
        url: '/rest/analysis/user/added_expired/zone',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取总用户的行业统计
var totalIndustryAjax;
exports.getTotalIndustry = function(obj) {
    totalIndustryAjax && totalIndustryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    totalIndustryAjax = $.ajax({
        url: '/rest/analysis/user/total/industry',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增用户的行业统计
var addedIndustryAjax;
exports.getAddedIndustry = function(obj) {
    addedIndustryAjax && addedIndustryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedIndustryAjax = $.ajax({
        url: '/rest/analysis/user/added/industry',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取过期用户的行业统计
var expiredIndustryAjax;
exports.getExpiredIndustry = function(obj) {
    expiredIndustryAjax && expiredIndustryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    expiredIndustryAjax = $.ajax({
        url: '/rest/analysis/user/expired/industry',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增过期用户的行业统计
var addedExpiredIndustryAjax;
exports.getAddedExpiredIndustry = function(obj) {
    addedExpiredIndustryAjax && addedExpiredIndustryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedExpiredIndustryAjax = $.ajax({
        url: '/rest/analysis/user/added_expired/industry',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取用户活跃度统计
var activeNessAjax;
exports.getUserActiveNess = function(dataType,dataRange,obj) {
    activeNessAjax && activeNessAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    activeNessAjax = $.ajax({
        url: `/rest/analysis/user/activeness/${dataType}/${dataRange}`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取用户活跃时间段
var activeTimeAjax;
exports.getUserActiveTime = function(obj) {
    activeTimeAjax && activeTimeAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    activeTimeAjax = $.ajax({
        url: '/rest/analysis/user/activetime',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取用户类型
/**
 * 获取用户类型，以便于区分 当前登录用户 是“只有一个团队的销售经理(或舆情秘书)” 还是 “有多个团队的销售经理”
 */
exports.getUserType = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/group_position',
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};


//获取总用户的成员统计
var totalMemberAjax;
exports.getTotalMember = function(obj) {
    totalMemberAjax && totalMemberAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    totalMemberAjax = $.ajax({
        url: '/rest/analysis/user/total/member',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增用户的成员统计
var addedMemberAjax;
exports.getAddedMember = function(obj) {
    addedMemberAjax && addedMemberAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedMemberAjax = $.ajax({
        url: '/rest/analysis/user/added/member',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取过期用户的成员统计
var expiredMemberAjax;
exports.getExpiredMember = function(obj) {
    expiredMemberAjax && expiredMemberAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    expiredMemberAjax = $.ajax({
        url: '/rest/analysis/user/expired/member',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取新增过期用户的成员统计
var addedExpiredMemberAjax;
exports.getAddedExpiredMember = function(obj) {
    addedExpiredMemberAjax && addedExpiredMemberAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    addedExpiredMemberAjax = $.ajax({
        url: '/rest/analysis/user/added_expired/member',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取用户登录时长统计
var loginLongAjax;
exports.getUserLoginLong = function(dataType,dataRange,obj) {
    loginLongAjax && loginLongAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    loginLongAjax = $.ajax({
        url: `/rest/analysis/user/${dataType}/login_long/${dataRange}`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//用户留存
var retentionAjax;
exports.getRetention = function(obj) {
    retentionAjax && retentionAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    retentionAjax = $.ajax({
        url: '/rest/analysis/user/retention',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 用户类型统计
let userTypeStatisticsAjax;
exports.getUserTypeStatistics = function(dataType,obj) {
    userTypeStatisticsAjax && userTypeStatisticsAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    userTypeStatisticsAjax = $.ajax({
        url: `/rest/analysis/user/${dataType}/type`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 应用的启停用状态统计
let appStatusAjax;
exports.getAppStatus = function(dataType,obj) {
    appStatusAjax && appStatusAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    appStatusAjax = $.ajax({
        url: `/rest/analysis/app/${dataType}/status`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 全部应用下（综合）,团队统计
let appsTeamAjax;
exports.getAppsTeam = function(dataType, obj) {
    appsTeamAjax && appsTeamAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    appsTeamAjax = $.ajax({
        url: `/rest/analysis/user/v1/apps/${dataType}/team`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 全部应用下（综合）,行业统计
let appsIndustryAjax;
exports.getAppsIndustry = function(dataType, obj) {
    appsIndustryAjax && appsIndustryAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    appsTeamAjax = $.ajax({
        url: `/rest/analysis/user/v1/apps/${dataType}/industry`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

// 全部应用下（综合）,地域统计
let appsZoneAjax;
exports.getAppsZone = function(dataType, obj) {
    appsZoneAjax && appsZoneAjax.abort();
    obj = obj || {};
    var Deferred = $.Deferred();
    appsTeamAjax = $.ajax({
        url: `/rest/analysis/user/v1/apps/${dataType}/zone`,
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};