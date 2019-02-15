/**
 * author:周连毅
 * 说明：统计分析-用户分析的service文件
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var Promise = require('bluebird');
var auth = require('../../../../lib/utils/auth');
const ROLE_CONSTANTS = require('../../../../lib/consts').ROLE_CONSTANS;

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
//定义url
var urls = {
    // 获取 统计数字（总用户、新增用户、过期用户、新增过期用户）
    getSummaryNumbers: '/rest/analysis/user/v1/:auth_type/summary',
    // 获取总用户的用户统计
    getTotalSummary: '/rest/analysis/user/v1/:auth_type/total/summary',
    // 获取新增用户的用户统计
    getAddedSummary: '/rest/analysis/user/v1/:auth_type/added/summary',
    //获取过期用户的用户统计
    getExpiredSummary: '/rest/analysis/user/v1/:auth_type/expired/summary',
    //获取新增过期用户的用户统计
    getAddedExpiredSummary: '/rest/analysis/user/v1/:auth_type/added_expired/summary',
    //获取总用户的团队统计
    getTotalTeam: '/rest/analysis/user/v1/:auth_type/total/team',
    //获取新增用户的团队统计
    getAddedTeam: '/rest/analysis/user/v1/:auth_type/added/team',
    //获取过期用户的团队统计
    getExpiredTeam: '/rest/analysis/user/v1/:auth_type/expired/team',
    //获取新增过期用户的团队统计
    getAddedExpiredTeam: '/rest/analysis/user/v1/:auth_type/added_expired/team',
    //获取总用户的地域统计
    getTotalZone: '/rest/analysis/user/v1/:auth_type/total/zone',
    //获取新增用户的地域统计
    getAddedZone: '/rest/analysis/user/v1/:auth_type/added/zone',
    //获取过期用户的地域统计
    getExpiredZone: '/rest/analysis/user/v1/:auth_type/expired/zone',
    //获取新增过期用户的地域统计
    getAddedExpiredZone: '/rest/analysis/user/v1/:auth_type/added_expired/zone',
    //获取总用户的行业统计
    getTotalIndustry: '/rest/analysis/user/v1/:auth_type/total/industry',
    //获取销售开通各应用用户数的统计
    getSalesOpenUserAnalysis: '/rest/customer/v2/customer/:auth_type/app/user/count',
    //获取新增用户的行业统计
    getAddedIndustry: '/rest/analysis/user/v1/:auth_type/added/industry',
    //获取过期用户的行业统计
    getExpiredIndustry: '/rest/analysis/user/v1/:auth_type/expired/industry',
    //获取新增过期用户的行业统计
    getAddedExpiredIndustry: '/rest/analysis/user/v1/:auth_type/added_expired/industry',
    //获取总用户活跃度统计
    getActiveNessTotal: '/rest/analysis/user/v1/:auth_type/:app_id/users/activation/:data_range',
    //新增用户活跃度统计
    getActiveNessAdded: '/rest/analysis/user/v1/:auth_type/new_added/users/activation/:data_range',
    //过期用户活跃度统计
    getActiveNessExpired: '/rest/analysis/user/v1/:auth_type/expired/:app_id/users/activation/:data_range',
    //获取用户活跃时间段
    getActiveTime: '/rest/analysis/auditlog/v1/:app_id/operations/:interval',
    //获取总用户的成员统计
    getTotalMember: '/rest/analysis/user/v1/:auth_type/total/member',
    //获取新增用户的成员统计
    getAddedMember: '/rest/analysis/user/v1/:auth_type/added/member',
    //获取过期用户的成员统计
    getExpiredMember: '/rest/analysis/user/v1/:auth_type/expired/member',
    //获取新增过期用户的成员统计
    getAddedExpiredMember: '/rest/analysis/user/v1/:auth_type/added_expired/member',
    //总用户登录时长统计
    getTotalUserLoginLong: '/rest/analysis/user/v1/total/login_long',
    //过期用户登录时长统计
    getExpiredLoginLong: '/rest/analysis/user/v1/expired/login_long',
    //获取用户留存
    getRetention: '/rest/analysis/user/v1/retention',
    //获取团队列表
    getTeams: '/rest/base/v1/group/myteam',
    //获取团队成员
    getMembers: '/rest/base/v1/group/member',
    // 获取用户类型统计 analysis_type是指：总用户、新增用户、过期用户、新增过期用户
    getUserTypeStatistics: '/rest/analysis/user/v1/:auth_type/:analysis_type/type',
    // 获取应用的启停用统计 analysis_type是指：总用户、新增用户、过期用户、新增过期用户
    getAppStatus: '/rest/analysis/user/v1/:auth_type/:analysis_type/status',
    // 获取全部应用下的团队、地域和行业统计 analysis_type是指：总用户、新增用户、过期用户、新增过期用户
    getAppsStatistics: '/rest/analysis/user/v1/:auth_type/apps/:analysis_type',
    // 获取应用下载的统计
    getAppsDownloadStatistics: '/rest/base/v1/application/download/statistic',
    v2: {
        // 获取 统计数字（总用户、新增用户、过期用户、新增过期用户）
        getSummaryNumbers: '/rest/analysis/user/v2/summary',
        getAllSummaryNumbers: '/rest/analysis/user/v2/manager/summary',
        // 获取新增用户的用户统计
        getAddedSummary: '/rest/analysis/user/v2/added/summary',
        getAllAddedSummary: '/rest/analysis/user/v2/manager/added/summary',
        // 获取总用户的用户统计
        getTotalSummary: '/rest/analysis/user/v2/total/summary',
        //获取总用户的团队统计
        getTotalTeam: '/rest/analysis/user/v2/total/team',
        //获取总用户的地域统计
        getTotalZone: '/rest/analysis/user/v2/total/zone',
        //获取总用户的行业统计
        getTotalIndustry: '/rest/analysis/user/v2/total/industry',
        //获取新增用户的团队统计
        getAddedTeam: '/rest/analysis/user/v2/added/team',
        getAllAddedTeam: '/rest/analysis/user/v2/manager/added/team',
        //获取新增用户的成员统计
        getAddedMember: '/rest/analysis/user/v2/added/member',
        getAllAddedMember: '/rest/analysis/user/v2/manager/added/member',
        //获取新增用户的地域统计
        getAddedZone: '/rest/analysis/user/v2/added/zone',
        getAllAddedZone: '/rest/analysis/user/v2/manager/added/zone',
        //获取新增用户的行业统计
        getAddedIndustry: '/rest/analysis/user/v2/added/industry',
        getAllAddedIndustry: '/rest/analysis/user/v2/manager/added/industry'
    }
};
//导出url
exports.urls = urls;

// 获取 统计数字（总用户、新增用户、过期用户、新增过期用户）
exports.getSummaryNumbers = function(req, res, queryParams) {
    let url = urls.getSummaryNumbers;
    //销售首页
    if (queryParams.urltype === 'v2') {
        if (queryParams.dataType === 'all') {
            url = urls.v2.getAllSummaryNumbers;
        } else {
            url = urls.v2.getSummaryNumbers;
        }
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.dataType;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

// 获取总用户的用户统计
exports.getTotalSummary = function(req, res, queryParams) {
    let url = urls.getTotalSummary;
    if (queryParams.urltype === 'v2') {
        url = urls.v2.getTotalSummary;
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res,
        }, queryParams);
};

//获取新增用户的用户统计
exports.getAddedSummary = function(req, res, queryParams) {
    let url = urls.getAddedSummary;
    if (queryParams.urltype === 'v2') {
        if (queryParams.dataType === 'all') {
            url = urls.v2.getAllAddedSummary;
        } else {
            url = urls.v2.getAddedSummary;
        }
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.dataType;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res,
        }, queryParams);
};

//获取过期用户的用户统计
exports.getExpiredSummary = function(req, res, queryParams) {
    let url = urls.getExpiredSummary;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res,
        }, queryParams);
};

//获取新增过期用户的用户统计
exports.getAddedExpiredSummary = function(req, res, queryParams) {
    let url = urls.getAddedExpiredSummary;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res,
        }, queryParams);
};

//获取总用户的团队统计
exports.getTotalTeam = function(req, res, queryParams) {
    let url = urls.getTotalTeam;
    if (queryParams.urltype === 'v2') {
        url = urls.v2.getTotalTeam;
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取新增用户的团队统计
exports.getAddedTeam = function(req, res, queryParams) {
    let url = urls.getAddedTeam;
    if (queryParams.urltype === 'v2') {
        if (queryParams.dataType === 'all') {
            url = urls.v2.getAllAddedTeam;
        } else {
            url = urls.v2.getAddedTeam;
        }
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.dataType;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取过期用户的团队统计
exports.getExpiredTeam = function(req, res, queryParams) {
    let url = urls.getExpiredTeam;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取新增过期用户的团队统计
exports.getAddedExpiredTeam = function(req, res, queryParams) {
    let url = urls.getAddedExpiredTeam;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取总用户的地域统计
exports.getTotalZone = function(req, res, queryParams) {
    let url = urls.getTotalZone;
    if (queryParams.urltype === 'v2') {
        url = urls.v2.getTotalZone;
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取新增用户的地域统计
exports.getAddedZone = function(req, res, queryParams) {
    let url = urls.getAddedZone;
    if (queryParams.urltype === 'v2') {
        if (queryParams.dataType === 'all') {
            url = urls.v2.getAllAddedZone;
        } else {
            url = urls.v2.getAddedZone;
        }
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.dataType;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取过期用户的地域统计
exports.getExpiredZone = function(req, res, queryParams) {
    let url = urls.getExpiredZone;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取新增过期用户的地域统计
exports.getAddedExpiredZone = function(req, res, queryParams) {
    let url = urls.getAddedExpiredZone;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取总用户的行业统计
exports.getTotalIndustry = function(req, res, queryParams) {
    let url = urls.getTotalIndustry;
    if (queryParams.urltype === 'v2') {
        url = urls.v2.getTotalIndustry;
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

// 获取销售开通各应用用户数的统计
exports.getSalesOpenUserAnalysis = function(req, res, queryParams) {
    return restUtil.authRest.get(
        {
            url: urls.getSalesOpenUserAnalysis.replace(':auth_type', queryParams.authType),
            req: req,
            res: res
        }, null);
};

//获取新增用户的行业统计
exports.getAddedIndustry = function(req, res, queryParams) {
    let url = urls.getAddedIndustry;
    if (queryParams.urltype === 'v2') {
        url = urls.v2.getAddedIndustry;
        if (queryParams.dataType === 'all') {
            url = urls.v2.getAllAddedIndustry;
        }
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.dataType;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取过期用户的行业统计
exports.getExpiredIndustry = function(req, res, queryParams) {
    let url = urls.getExpiredIndustry;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取新增过期用户的行业统计
exports.getAddedExpiredIndustry = function(req, res, queryParams) {
    let url = urls.getAddedExpiredIndustry;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取团队
function getTeams(req, res) {
    return new Promise((resolve, reject) => {
        restUtil.authRest.get(
            {
                url: urls.getTeams,
                req: req,
                res: res
            }, {}, {
                success: function(eventEmitter, result) {
                    resolve(result);
                },
                error: function(eventEmitter, errorDesc) {
                    reject(errorDesc && errorDesc.message);
                }
            });
    });
}

//获取成员
function getMembers(req, res) {
    return new Promise((resolve, reject) => {
        getTeams(req, res).then(function(teams) {
            if (!_.isArray(teams) || _.isEmpty(teams)) {
                var user = auth.getUser(req);
                resolve({
                    type: 'sales',
                    list: [
                        {
                            id: user.user_id,
                            name: ''
                        }
                    ]
                });
            } else {
                if (teams.length > 1) {
                    var list = _.map(teams, function(team) {
                        return {
                            id: team.group_id,
                            name: team.group_name
                        };
                    });
                    resolve({
                        type: 'teams',
                        list: list
                    });
                } else {
                    var team_id = teams[0].group_id;
                    restUtil.authRest.get(
                        {
                            url: urls.getMembers + '/' + team_id,
                            req: req,
                            res: res
                        }, {}, {
                            success: function(eventEmitter, result) {
                                if (!_.isArray(result) || _.isEmpty(result)) {
                                    var user = auth.getUser(req);
                                    resolve({
                                        type: 'sales',
                                        list: [
                                            {
                                                id: user.user_id,
                                                name: ''
                                            }
                                        ]
                                    });
                                } else {
                                    var list = _.map(result, function(sales) {
                                        return {
                                            id: sales.user_id,
                                            name: sales.nick_name
                                        };
                                    });
                                    resolve({
                                        type: 'sales',
                                        list: list
                                    });
                                }
                            },
                            error: function(eventEmitter, errorDesc) {
                                reject(errorDesc && errorDesc.message);
                            }
                        });
                }
            }
        }).catch(function(errorMsg) {
            reject(errorMsg);
        });
    });
}

//获取活跃度一条曲线的数据
function getActiveNessLineData(req, res, reqParams, dataType, dataRange, authType) {
    let userName = reqParams.userName;
    delete reqParams.userName;
    return new Promise((resolve, reject) => {
        var restUrl;
        if (dataType === 'total') {
            restUrl = urls.getActiveNessTotal;
        } else if (dataType === 'added') {
            restUrl = urls.getActiveNessAdded;
        } else if (dataType === 'expired') {
            restUrl = urls.getActiveNessExpired;
        }
        return restUtil.authRest.get(
            {
                url: restUrl.replace(':app_id', reqParams.app_id)
                    .replace(':auth_type', authType)
                    .replace(':data_range', dataRange),
                req: req,
                res: res
            }, reqParams, {
                success: function(eventEmitter, data) {
                    if (dataType !== 'total' && data && data[0] && data[0].appId) {
                        resolve({
                            userName: userName,
                            datas: data[0].actives
                        });
                    } else {
                        resolve({
                            userName: userName,
                            datas: data
                        });
                    }
                },
                error: function(eventEmitter, errorDesc) {
                    reject(errorDesc && errorDesc.message);
                }
            });
    });
}

//获取用户活跃度统计
exports.getActiveNess = function(req, res, dataType, dataRange, queryParams) {
    let authType = queryParams.authType;
    delete queryParams.authType;
    var emitter = new EventEmitter();
    //如果是销售、舆情秘书、销售团队管理者(页面中画线画多条线)
    if (auth.hasRole(req, ROLE_CONSTANTS.SALES) ||
        auth.hasRole(req, ROLE_CONSTANTS.SECRETARY) ||
        auth.hasRole(req, ROLE_CONSTANTS.SALES_LEADER)
    ) {
        getMembers(req, res).then(function(memberResult) {
            var memberType = memberResult.type;
            var memberList = memberResult.list;
            var promiseList = [];
            _.each(memberList, function(member) {
                var reqParam = queryParams;
                reqParam.userName = member.name;
                if (memberType === 'sales') {
                    reqParam.sales_id = member.id;
                } else {
                    reqParam.team_id = member.id;
                }
                promiseList.push(getActiveNessLineData(req, res, reqParam, dataType, dataRange, authType));
            });
            Promise.all(promiseList).then(function(lineList) {
                emitter.emit('success', lineList);
            }, function(errorMsg) {
                emitter.emit('error', errorMsg);
            });
        }, function(errorMsg) {
            emitter.emit('error', errorMsg);
        });
        //如果不是销售，使用之前的逻辑
    } else {
        var reqParams = queryParams;
        reqParams.userName = '';
        var lines = [];
        getActiveNessLineData(req, res, reqParams, dataType, dataRange, authType).then(function(lineObj) {
            lines.push(lineObj);
            emitter.emit('success', lines);
        }, function(errorMsg) {
            emitter.emit('error', errorMsg);
        });
    }
    return emitter;
};

//获取用户活跃时间段以weekly为间隔获取数据
exports.getActiveTime = function(req, res, queryParams) {
    delete queryParams.authType;
    let app_id = queryParams.app_id;
    return restUtil.authRest.get(
        {
            url: urls.getActiveTime.replace(':app_id', app_id).replace(':interval', 'weekly'),
            req: req,
            res: res
        }, queryParams);
};
//获取全部成员
exports.getTotalMember = function(req, res, queryParams) {
    let url = urls.getTotalMember;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取新增成员
exports.getAddedMember = function(req, res, queryParams) {
    let url = urls.getAddedMember;
    if (queryParams.urltype === 'v2') {
        url = urls.v2.getAddedMember;
        if (queryParams.dataType === 'all') {
            url = urls.v2.getAllAddedMember;
        }
    } else {//用户分析
        if (queryParams.authType) {//common、manager
            url = url.replace(':auth_type', queryParams.authType);
        }
    }
    delete queryParams.urltype;
    delete queryParams.dataType;
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取过期成员
exports.getExpiredMember = function(req, res, queryParams) {
    let url = urls.getExpiredMember;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取新增过期成员
exports.getAddedExpiredMember = function(req, res, queryParams) {
    let url = urls.getAddedExpiredMember;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

//获取登录时长统计
exports.getLoginLong = function(req, res, dataType, hours, queryParams) {
    delete queryParams.authType;
    var restUrl = '';
    var requestObj = queryParams;
    requestObj.ranges = hours;
    if (dataType === 'total') {
        restUrl = urls.getTotalUserLoginLong;
    } else if (dataType === 'expired') {
        restUrl = urls.getExpiredLoginLong;
        requestObj.begin_date = queryParams.startTime;
        requestObj.end_date = queryParams.endTime;
    }
    return restUtil.authRest.get(
        {
            url: restUrl,
            req: req,
            res: res
        }, requestObj);
};

//获取用户留存
exports.getRetention = function(req, res, queryParams) {
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: urls.getRetention,
            req: req,
            res: res
        }, queryParams);
};

// 获取用户类型统计
exports.getUserTypeStatistics = function(req, res, analysis_type, queryParams) {
    let url = urls.getUserTypeStatistics;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url.replace(':analysis_type', analysis_type),
            req: req,
            res: res
        }, queryParams);
};

// 获取应用的启停用统计
exports.getAppStatus = function(req, res, analysis_type, queryParams) {
    let url = urls.getAppStatus;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url.replace(':analysis_type', analysis_type),
            req: req,
            res: res
        }, queryParams);
};

// 全部应用下，获取团队统计
exports.getAppsTeam = function(req, res, analysis_type, team, queryParams) {
    let url = urls.getAppsStatistics;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url.replace(':analysis_type', analysis_type) + '/' + team,
            req: req,
            res: res
        }, queryParams);
};

// 全部应用下，获取行业统计
exports.getAppsIndustry = function(req, res, analysis_type, industry, queryParams) {
    let url = urls.getAppsStatistics;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url.replace(':analysis_type', analysis_type) + '/' + industry,
            req: req,
            res: res
        }, queryParams);
};

// 全部应用下，获取地域统计
exports.getAppsZone = function(req, res, analysis_type, zone, queryParams) {
    let url = urls.getAppsStatistics;
    if (queryParams.authType) {//common、manager
        url = url.replace(':auth_type', queryParams.authType);
    }
    delete queryParams.authType;
    return restUtil.authRest.get(
        {
            url: url.replace(':analysis_type', analysis_type) + '/' + zone,
            req: req,
            res: res
        }, queryParams);
};

// 获取应用下载的统计
exports.getAppsDownloadStatistics = (req, res, queryParams) => {
    return restUtil.authRest.get(
        {
            url: urls.getAppsDownloadStatistics,
            req: req,
            res: res
        }, queryParams);
};
