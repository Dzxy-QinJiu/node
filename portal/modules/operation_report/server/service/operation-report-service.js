/**
 * author:王丽平
 * 说明：统计分析-用户分析的service文件
 */
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var Promise = require("bluebird");
var auth = require("../../../../lib/utils/auth");
var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
//统一的路径前缀
let URL_PREFIX = '/rest/analysis/user/v1/operation_report';
//定义url
var urls = {
    // 获取各应用登录情况
    getAppLoginUser: URL_PREFIX + '/logined_user/app/dis',
    //获取各应用新增账号的统计
    getAppNewTrialUser: URL_PREFIX + '/added_user/trial/app/dis',
    //获取各应用新增延期用户的统计
    getAppNewDelayUser: URL_PREFIX + '/delayed_user/app/dis',
    //获取近四周的登录对比
    getAppLoginComparison: URL_PREFIX + '/logined_user/active/weekly',
    //获取近四周周登录总时长超过1小时的用户数对比
    getAppWeeklyLoginTotalTime: URL_PREFIX + '/logined_user/excced/1/weekly',
    //获取近四周到期用户的登录对比
    getAppExpiredLoginComparison: URL_PREFIX + '/logined_user/expired/active/weekly',
    //获取近四周用户活跃度
    getUserActive: URL_PREFIX + '/logined_user/activeness/weekly',
    //获取近四周新开用户对比
    getAppNewUserComparison: URL_PREFIX + '/added/trial/trend/weekly',
    //获取近四周新增延期用户对比
    getAppNewDelayUserComparison: URL_PREFIX + '/added/delayed/trend/weekly',
    //获取近四周签约用户的登录对比
    getAppFormalUserLoginComparison: URL_PREFIX + '/logined_user/signed/active/weekly',
    //获取各部门到期用户的登录表格数据
    getTeamExpiredLoginUser: URL_PREFIX + '/logined_user/expired/team/dis',
    //获取到期用户的周登录时长超1小时的各应用的用户数
    getExpiredUserExceedLoginTime: URL_PREFIX + '/logined_user/expired/excced/1/app/dis',
    //获取各部门到期用户的登录时长表格数据
    getTeamExpiredUserLoginTime: URL_PREFIX + '/logined_user/expried/excced_loginlong/team/dis',
    //获取各部门新开试用账号登录的统计表格数据
    getTeamNewTrialLoginUser: URL_PREFIX + '/logined_user/added/trial/team/dis',
    //获取各部门新增延期账号登录的统计表格数据
    getTeamNewDelayLoginUser: URL_PREFIX + '/logined_user/added/delayed/team/dis',
    //获取各部门登录超过x小时的统计表格数据
    getTeamExceedLoginTime: URL_PREFIX + '/logined_user/added/trial/excced_loginlong/team/dis',
    //获取各部门登录超过x小时的延期用户统计表格数据
    getTeamDelayUserLoginTime: URL_PREFIX + '/logined_user/added/delayed/excced_loginlong/team/dis',
    //获取各部门签约用户的登录表格数据
    getTeamSignedLoginUser: URL_PREFIX + '/logined_user/signed/team/dis',
    //获取各应用登录用户数的部门分布表格数据
    getTeamLoginUser: URL_PREFIX + '/logined_user/team/dis',
    //获取各应用的签约用户数
    getAppSignedUser: URL_PREFIX + '/signed_user/app/dis',
    //获取用户日活跃度
    getUserDailyActive: URL_PREFIX + '/logined_user/activeness/daily',
    //获取各新开试用用户的部门分布
    getTeamNewTrialUser: URL_PREFIX + '/added/trialed_user/team/dis',
    //获取各新增延期用户的部门分布
    getTeamNewDelayUser: URL_PREFIX + '/delayed_user/team/dis'

};
//导出url
exports.urls = urls;
const weekTime = 7 * 24 * 60 * 60 * 1000;

//获取各应用的签约用户数
exports.getAppSignedUser = function (req, res, queryParams) {
    //签约总用户数开始时间传0
    queryParams.start_time = 0;
    return restUtil.authRest.get(
        {
            url: urls.getAppSignedUser,
            req: req,
            res: res
        }, queryParams);
};
//获取到期用户的周登录时长超1小时的各应用的用户数
exports.getExpiredUserExceedLoginTime = function (req, res, queryParams) {
    return restUtil.authRest.get(
        {
            url: urls.getExpiredUserExceedLoginTime,
            req: req,
            res: res
        }, queryParams);
};

// 获取各应用登录情况
exports.getAppLoginUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    //获取上一周数据的参数
    let lastWeekParams = {
        app_id: queryParams.app_id,
        start_time: queryParams.start_time - weekTime,
        end_time: queryParams.end_time - weekTime
    };
    let promiseList = [getDataPromise(req, res, queryParams, urls.getAppLoginUser), getDataPromise(req, res, lastWeekParams, urls.getAppLoginUser)];
    Promise.all(promiseList).then(function (resultList) {
        emitter.emit("success", resultList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各应用新增账号的统计
exports.getAppNewTrialUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    //获取上一周数据的参数
    let lastWeekParams = {
        app_id: queryParams.app_id,
        start_time: queryParams.start_time - weekTime,
        end_time: queryParams.end_time - weekTime
    };
    let promiseList = [getDataPromise(req, res, queryParams, urls.getAppNewTrialUser), getDataPromise(req, res, lastWeekParams, urls.getAppNewTrialUser)];
    Promise.all(promiseList).then(function (resultList) {
        emitter.emit("success", resultList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各应用新增延期用户的统计
exports.getAppNewDelayUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    //获取上一周数据的参数
    let lastWeekParams = {
        app_id: queryParams.app_id,
        start_time: queryParams.start_time - weekTime,
        end_time: queryParams.end_time - weekTime
    };
    let promiseList = [getDataPromise(req, res, queryParams, urls.getAppNewDelayUser), getDataPromise(req, res, lastWeekParams, urls.getAppNewDelayUser)];
    Promise.all(promiseList).then(function (resultList) {
        emitter.emit("success", resultList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

//获取近四周的登录对比
exports.getAppLoginComparison = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getAppLoginComparison));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取近四周周登录总时长超过1小时的用户数对比
exports.getAppWeeklyLoginTotalTime = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getAppWeeklyLoginTotalTime));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

//获取近四周到期用户的登录对比
exports.getAppExpiredLoginComparison = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getAppExpiredLoginComparison));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取近四周签约用户的登录对比
exports.getAppFormalUserLoginComparison = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getAppFormalUserLoginComparison));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

//近四周新开用户的对比
exports.getAppNewUserComparison = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getAppNewUserComparison));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取近四周新增延期用户对比
exports.getAppNewDelayUserComparison = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getAppNewDelayUserComparison));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取近四周的用户活跃度
exports.getUserActive = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;//appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getUserActive));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

//获取用户日活
exports.getUserDailyActive = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;//appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getUserDailyActive));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

//获取各部门签约用户的登录表格数据
exports.getTeamSignedLoginUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getTeamSignedLoginUser));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各应用登录用户数的部门分布表格数据
exports.getTeamLoginUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getTeamLoginUser));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各部门到期用户的登录表格数据
exports.getTeamExpiredLoginUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    //获取上一周数据的参数
    let lastWeekParams = {
        app_id: queryParams.app_id,
        start_time: queryParams.start_time - weekTime,
        end_time: queryParams.end_time - weekTime
    };
    let promiseList = [getPromiseListData(req, res, queryParams, urls.getTeamExpiredLoginUser), getPromiseListData(req, res, lastWeekParams, urls.getTeamExpiredLoginUser)];
    Promise.all(promiseList).then(function (resultList) {
        emitter.emit("success", resultList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

function getPromiseListData(req, res, reqParams, url) {
    return new Promise((resolve, reject) => {
        let appIdArray = reqParams.app_id.split(',');
        let promiseList = [];
        appIdArray.forEach((appId)=> {
            reqParams.app_id = appId;
            promiseList.push(getDataPromise(req, res, reqParams, url));
        });
        return Promise.all(promiseList).then(function (lineList) {
            resolve(lineList);
        }, function (errorMsg) {
            reject(errorMsg);
        });
    });
}

//获取各部门到期用户的登录时长表格数据
exports.getTeamExpiredUserLoginTime = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    //获取上一周数据的参数
    let lastWeekParams = {
        app_id: queryParams.app_id,
        start_time: queryParams.start_time - weekTime,
        end_time: queryParams.end_time - weekTime
    };
    let promiseList = [getPromiseListData(req, res, queryParams, urls.getTeamExpiredUserLoginTime), getPromiseListData(req, res, lastWeekParams, urls.getTeamExpiredUserLoginTime)];
    Promise.all(promiseList).then(function (resultList) {
        emitter.emit("success", resultList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各部门新开试用账号的统计表格
exports.getTeamNewTrialUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getTeamNewTrialUser));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各部门新增延期用户的统计表格
exports.getTeamNewDelayUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getTeamNewDelayUser));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

//获取各部门新开试用账号登录的统计表格
exports.getTeamNewTrialLoginUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    //获取上一周数据的参数
    let lastWeekParams = {
        app_id: queryParams.app_id,
        start_time: queryParams.start_time - weekTime,
        end_time: queryParams.end_time - weekTime
    };
    let promiseList = [getPromiseListData(req, res, queryParams, urls.getTeamNewTrialLoginUser), getPromiseListData(req, res, lastWeekParams, urls.getTeamNewTrialLoginUser)];
    Promise.all(promiseList).then(function (resultList) {
        emitter.emit("success", resultList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各部门新增延期用户登录的统计表格
exports.getTeamNewDelayLoginUser = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    //获取上一周数据的参数
    let lastWeekParams = {
        app_id: queryParams.app_id,
        start_time: queryParams.start_time - weekTime,
        end_time: queryParams.end_time - weekTime
    };
    let promiseList = [getPromiseListData(req, res, queryParams, urls.getTeamNewDelayLoginUser), getPromiseListData(req, res, lastWeekParams, urls.getTeamNewDelayLoginUser)];
    Promise.all(promiseList).then(function (resultList) {
        emitter.emit("success", resultList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各部门登录超过x小时的统计表格数据
exports.getTeamExceedLoginTime = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getTeamExceedLoginTime));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};
//获取各部门登录超过x小时的延期用统计表格数据
exports.getTeamDelayUserLoginTime = function (req, res, queryParams) {
    var emitter = new EventEmitter();
    let appIdArray = queryParams.app_id.split(',');
    let promiseList = [];
    appIdArray.forEach((appId)=> {
        queryParams.app_id = appId;
        promiseList.push(getDataPromise(req, res, queryParams, urls.getTeamDelayUserLoginTime));
    });
    Promise.all(promiseList).then(function (lineList) {
        emitter.emit("success", lineList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

function getDataPromise(req, res, reqParams, url) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: url,
                req: req,
                res: res
            }, reqParams, {
                success: function (eventEmitter, result) {
                    resolve(result);
                },
                error: function (eventEmitter, errorDesc) {
                    reject(errorDesc.message);
                }
            });
    });
};
