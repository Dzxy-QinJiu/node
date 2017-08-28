//获取应用列表
let appAjaxTrans = require("../../../common/public/ajax/app");
let teamAjaxTrans = require("../../../common/public/ajax/team");
exports.getAppList = function () {
    var Deferred = $.Deferred();
    //调用统一的接口发请求
    appAjaxTrans.getGrantApplicationListAjax().sendRequest().
    success(function (list) {
        list = list.map(function (app) {
            return {
                id: app.app_id,
                name: app.app_name,
                image: app.app_logo
            };
        });
        Deferred.resolve(list);
    }).error(function (error) {
        Deferred.resolve(error.responseText);
    }).timeout(function () {
        Deferred.resolve([]);
    });
    return Deferred.promise();
};

//获取团队列表
let teamListAjax;
exports.getTeamList = function () {
    teamListAjax && teamListAjax.abort();
    var Deferred = $.Deferred();
    teamAjaxTrans.getTeamListAjax().sendRequest().
    success(function (list) {
        list = list.map(function (team) {
            return {
                teamId: team.groupId,
                teamName: team.groupName,
            };
        });
        Deferred.resolve(list);
    }).error(function (error) {
        Deferred.resolve(error.responseText);
    }).timeout(function () {
        Deferred.resolve([]);
    });
    return Deferred.promise();
};
//各应用登录情况
let appLoginAjax;
exports.getAppLoginUser = function (params) {
    appLoginAjax && appLoginAjax.abort();
    var Deferred = $.Deferred();
    appLoginAjax = $.ajax({
        url: '/operation_report/login_user/app',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各应用新开账号统计
let appSignedUserAjax;
exports.getAppSignedUser = function (params) {
    appSignedUserAjax && appSignedUserAjax.abort();
    var Deferred = $.Deferred();
    appSignedUserAjax = $.ajax({
        url: '/operation_report/signed_user/app',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各应用新开账号统计
let appNewTrialUserAjax;
exports.getAppNewTrialUser = function (params) {
    appNewTrialUserAjax && appNewTrialUserAjax.abort();
    var Deferred = $.Deferred();
    appNewTrialUserAjax = $.ajax({
        url: '/operation_report/trial_user/app',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各应用延期用户的统计
let appNewDelayUserAjax;
exports.getAppNewDelayUser = function (params) {
    appNewDelayUserAjax && appNewDelayUserAjax.abort();
    var Deferred = $.Deferred();
    appNewDelayUserAjax = $.ajax({
        url: '/operation_report/delay_user/app',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取近四周的登录对比
let loginComparisonAjx;
exports.getAppLoginComparison = function (params) {
    loginComparisonAjx && loginComparisonAjx.abort();
    var Deferred = $.Deferred();
    loginComparisonAjx = $.ajax({
        url: '/operation_report/login/comparison',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};


//获取近四周的登录对比
let appsUserCountAjx;
exports.getAppsUserCount = function (params) {
    appsUserCountAjx && appsUserCountAjx.abort();
    var Deferred = $.Deferred();
    appsUserCountAjx = $.ajax({
        url: '/rest/analysis/user/summary',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取近四周周登录总时长超过1小时的用户数对比
let weeklyLoginTotalTimeAjax;
exports.getAppWeeklyLoginTotalTime = function (params) {
    weeklyLoginTotalTimeAjax && weeklyLoginTotalTimeAjax.abort();
    var Deferred = $.Deferred();
    weeklyLoginTotalTimeAjax = $.ajax({
        url: '/operation_report/weekly/login/total_time',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取近四周到期用户登录对比
let expiredLoginComparisonAjx;
exports.getAppExpiredLoginComparison = function (params) {
    expiredLoginComparisonAjx && expiredLoginComparisonAjx.abort();
    var Deferred = $.Deferred();
    expiredLoginComparisonAjx = $.ajax({
        url: '/operation_report/expired/login/comparison',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
// 获取近四周的用户活跃度
let userActiveAjax;
exports.getUserActive = function (params) {
    userActiveAjax && userActiveAjax.abort();
    var Deferred = $.Deferred();
    userActiveAjax = $.ajax({
        url: '/operation_report/user/active',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取用户日活跃度
let userDailyActiveAjax;
exports.getUserDailyActive = function (params) {
    userDailyActiveAjax && userDailyActiveAjax.abort();
    var Deferred = $.Deferred();
    if (params.end_time > new Date().getTime()) {
        params.end_time = new Date().getTime();
    }
    userDailyActiveAjax = $.ajax({
        url: '/operation_report/user/daily/active',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取近四周新开通用户对比
let appNewUserAjax;
exports.getAppNewUserComparison = function (params) {
    appNewUserAjax && appNewUserAjax.abort();
    var Deferred = $.Deferred();
    appNewUserAjax = $.ajax({
        url: '/operation_report/new_user/app',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取近四周新开通用户对比
let appNewDelayUserComparisonAjax;
exports.getAppNewDelayUserComparison = function (params) {
    appNewDelayUserComparisonAjax && appNewDelayUserComparisonAjax.abort();
    var Deferred = $.Deferred();
    appNewDelayUserComparisonAjax = $.ajax({
        url: '/operation_report/delay_user/comparison',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取近四周签约用户的登录对比
let appFormalLoginAjax;
exports.getAppFormalUserLoginComparison = function (params) {
    appFormalLoginAjax && appFormalLoginAjax.abort();
    var Deferred = $.Deferred();
    appFormalLoginAjax = $.ajax({
        url: '/operation_report/formal_user/login/app',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各部门到期用户的登录表格数据
let teamSignedLoginAjax;
exports.getTeamSignedLoginUser = function (params) {
    teamSignedLoginAjax && teamSignedLoginAjax.abort();
    var Deferred = $.Deferred();
    teamSignedLoginAjax = $.ajax({
        url: '/operation_report/team/signed_user/login',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各应用用户登录情况的部门分布表格数据
let teamLoginUserAjax;
exports.getTeamLoginUser = function (params) {
    teamLoginUserAjax && teamLoginUserAjax.abort();
    var Deferred = $.Deferred();
    teamLoginUserAjax = $.ajax({
        url: '/operation_report/team/user_login',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取各部门到期用户的登录表格数据
let teamExpiredLoginAjax;
exports.getTeamExpiredLoginUser = function (params) {
    teamExpiredLoginAjax && teamExpiredLoginAjax.abort();
    var Deferred = $.Deferred();
    teamExpiredLoginAjax = $.ajax({
        url: '/operation_report/team/expired_user/login',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取到期用户的周登录时长超1小时的各应用的用户数
let expiredUserExceedLoginTimeAjax;
exports.getExpiredUserExceedLoginTime = function (params) {
    expiredUserExceedLoginTimeAjax && expiredUserExceedLoginTimeAjax.abort();
    var Deferred = $.Deferred();
    expiredUserExceedLoginTimeAjax = $.ajax({
        url: '/operation_report/expired_user/exceed/login_time',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取到期用户登录时长统计表数据
let teamExpiredLoginTimeAjax;
exports.getTeamExpiredUserLoginTime = function (params) {
    teamExpiredLoginTimeAjax && teamExpiredLoginTimeAjax.abort();
    var Deferred = $.Deferred();
    teamExpiredLoginTimeAjax = $.ajax({
        url: '/operation_report/team/expired_user/login_time',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取各部门新开试用账号的统计表格
let teamNewTrialAjax;
exports.getTeamNewTrialUser = function (params) {
    teamNewTrialAjax && teamNewTrialAjax.abort();
    var Deferred = $.Deferred();
    teamNewTrialAjax = $.ajax({
        url: '/operation_report/team/trial_user',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各部门新增延期用户的统计表格
let teamNewDelayAjax;
exports.getTeamNewDelayUser = function (params) {
    teamNewDelayAjax && teamNewDelayAjax.abort();
    var Deferred = $.Deferred();
    teamNewDelayAjax = $.ajax({
        url: '/operation_report/team/delay_user',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各部门新开试用账号登录的统计表格
let teamNewTrialLoginAjax;
exports.getTeamNewTrialLoginUser = function (params) {
    teamNewTrialLoginAjax && teamNewTrialLoginAjax.abort();
    var Deferred = $.Deferred();
    teamNewTrialLoginAjax = $.ajax({
        url: '/operation_report/team/trial_user/login',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取各部门延期用户登录的统计表格
let teamNewDelayLoginAjax;
exports.getTeamNewDelayLoginUser = function (params) {
    teamNewDelayLoginAjax && teamNewDelayLoginAjax.abort();
    var Deferred = $.Deferred();
    teamNewDelayLoginAjax = $.ajax({
        url: '/operation_report/team/delay_user/login',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各部门登录超过x小时的统计表格数据
let teamExceedLoginTimeAjax;
exports.getTeamExceedLoginTime = function (params) {
    teamExceedLoginTimeAjax && teamExceedLoginTimeAjax.abort();
    var Deferred = $.Deferred();
    teamExceedLoginTimeAjax = $.ajax({
        url: '/operation_report/team/exceed/login_time',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取各部门登录超过x小时的延期用户统计表格数据
let teamDelayUserLoginTimeAjax;
exports.getTeamDelayUserLoginTime = function (params) {
    teamDelayUserLoginTimeAjax && teamDelayUserLoginTimeAjax.abort();
    var Deferred = $.Deferred();
    teamDelayUserLoginTimeAjax = $.ajax({
        url: '/operation_report/team/delay_user/login_time',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
