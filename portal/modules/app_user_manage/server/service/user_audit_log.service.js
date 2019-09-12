'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var auth = require('../../../../lib/utils/auth');

var AppUserRestApis = {
    //获取用户审计日志列表
    getUserLogs: '/rest/analysis/auditlog/v1/app/sales/drop_down_load',
    // 获取单个用户审计日志列表
    getSingleAuditLogList: '/rest/analysis/auditlog/v1/app/userdetail/',
    // 获取用户登录时长
    getLoginDuration: '/rest/analysis/auditlog/v1/:app_id/loginlong/:user_id',
    // 获取用户登录次数
    getLoginCount: '/rest/analysis/auditlog/v1/:app_id/logins/:user_id',
    // 获取用户首次登陆时间
    getFirstLoginTime: '/rest/analysis/auditlog/v1/:app_id/first_logins/:user_id',
    // 获取用户最后一次登录时间
    getLastLoginTime: '/rest/analysis/auditlog/v1/:app_id/last_logins/:user_id',
    // 获取用户登录时长统计
    getLoginDurationGraph: '/rest/analysis/auditlog/v1/:app_id/loginlong/:user_id/daily',
    // 获取用户登录频次
    getLoginFrequency: '/rest/analysis/auditlog/v1/:app_id/logins/:user_id/daily',
    // 获取用户的分数
    getLoginUserScore: '/rest/analysis/user/v1/search/:type/user/score',
    // 获取用户活跃的天数
    getLoginUserActiveDays: '/rest/analysis/user/v3/:type/days'
};

exports.urls = AppUserRestApis;

// 获取用户审计日志
exports.getUserLogList = function(req, res){
    var searchObj = req.body;
    let obj = {};
    if (_.isString(searchObj.bodyObj)){
        obj = JSON.parse(searchObj.bodyObj);
    }
    var url = AppUserRestApis.getUserLogs;
    if (_.isString(searchObj.queryObj)){
        var queryObj = JSON.parse(searchObj.queryObj);
        if (queryObj.appid){
            url += `?appid=${queryObj.appid}`;
            if (queryObj.sort_field){
                url += `&sort_field=${queryObj.sort_field}`;
            }
            if (queryObj.sort_order){
                url += `&sort_order=${queryObj.sort_order}`;
            }
            if (queryObj.search){
                var search = encodeURI(queryObj.search);
                url += `&search=${search}`;
            }
            if (queryObj.sort_id){
                //sort_id中带有中阔号时不会自动编码，需要手动处理
                url += `&sort_id=${encodeURIComponent(queryObj.sort_id)}`;
            }
            if (queryObj.load_size){
                url += `&load_size=${queryObj.load_size}`;
            }
        }
    }

    return restUtil.authRest.post({
        url: url,
        req: req,
        res: res
    }, obj);
};

// 获取单个用户审计日志
exports.getSingleAuditLogList = function(req, res, obj,user_id){
    return restUtil.authRest.get({
        url: AppUserRestApis.getSingleAuditLogList + user_id,
        req: req,
        res: res
    }, obj);
};


// 用户登录信息（时长、次数、首次和最后一次登录时间）
exports.getUserLoginInfo = function(req, res, obj){
    let emitter = new EventEmitter();
    let urlList = [{'duration': AppUserRestApis.getLoginDuration }, // 登录时长
        {'count': AppUserRestApis.getLoginCount }, // 登录次数
        {'first': AppUserRestApis.getFirstLoginTime }, // 首次登录
        {'last': AppUserRestApis.getLastLoginTime } // 最后一次登录
    ];
    // 西语环境下，没有登录时长的统计
    if ( auth.getLang() === 'es_VE') {
        urlList = [{'count': AppUserRestApis.getLoginCount }, // 登录次数
            {'first': AppUserRestApis.getFirstLoginTime }, // 首次登录
            {'last': AppUserRestApis.getLastLoginTime } // 最后一次登录
        ];
    }
    let loginList = handleLogin(req, res, obj, urlList);
    Promise.all(loginList).then( (results) => {
        emitter.emit('success' , results);
    }).catch( (errorMsg) => {
        emitter.emit('error' , errorMsg);
    } );
    return emitter;
};

exports.getUserLoginChartInfo = function(req, res, obj){
    let emitter = new EventEmitter();
    let urlList = [{'loginDuration': AppUserRestApis.getLoginDurationGraph }, // 登录时长统计
        {'loginCount': AppUserRestApis.getLoginFrequency } // 登录频次统计
    ];
    // 西语环境下，没有登录时长的统计
    if ( auth.getLang() === 'es_VE') {
        urlList = [
            {'loginCount': AppUserRestApis.getLoginFrequency } // 登录频次统计
        ];
    }
    let loginList = handleLogin(req, res, obj, urlList);
    Promise.all(loginList).then( (results) => {
        emitter.emit('success' , results);
    }).catch( (errorMsg) => {
        emitter.emit('error' , errorMsg);
    } );
    return emitter;
};

function handleLogin(req, res, obj, urlList) {
    let loginList = [];
    _.each(urlList, (item) => {
        for (let props in item){
            loginList.push(handleLoginInfo(req, res, obj, item[props], props));
        }
    });
    return loginList;
}

function handleLoginInfo(req, res, obj, url, param){
    let tempObj = _.clone(obj);
    let reqUrl = url;
    let app_id = tempObj.appid;
    let user_id = tempObj.user_id;
    if (url === AppUserRestApis.getLoginUserActiveDays) {
        reqUrl = url.replace(':type', req.params.type);
        // 过滤ip局域网配置，默认是0,0：不过滤，1：过滤，由于界面上数据是过滤局域网的，所以设置为1
        tempObj.ip = 1;
        tempObj.app_id = app_id;
        delete tempObj.appid;
    } else {
        reqUrl = url.replace(':app_id', app_id ).replace(':user_id',user_id);
        delete tempObj.appid;
        delete tempObj.user_id;
    }

    return new Promise( (resolve, reject) => {
        return restUtil.authRest.get({
            url: reqUrl,
            req: req,
            res: res
        }, tempObj, {
            success: function(eventEmitter, data) {
                if(data) {
                    let obj = {};
                    obj[param] = data;
                    resolve(obj);
                } else {
                    reject({message: '获取登录信息失败！'});
                }
            },
            error: function(eventEmitter , errorDesc) {
                reject(errorDesc.message);
            }
        });
    } );
}

// 获取用户的分数
exports.getLoginUserScore = function(req, res){
    let params = req.params;
    return restUtil.authRest.get({
        url: AppUserRestApis.getLoginUserScore.replace(':type', params.type),
        req: req,
        res: res
    }, req.query);
};

// 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
exports.getLoginUserActiveStatistics = (req, res, reqParams) => {
    let emitter = new EventEmitter();
    let urlList = [{'duration': AppUserRestApis.getLoginDuration }, // 登录时长
        {'count': AppUserRestApis.getLoginCount }, // 登录次数
        {'activeDays': AppUserRestApis.getLoginUserActiveDays } // 活跃天数
    ];

    let loginList = handleLogin(req, res, reqParams, urlList);
    Promise.all(loginList).then( (results) => {
        emitter.emit('success' , results);
    }).catch( (errorMsg) => {
        emitter.emit('error' , errorMsg);
    } );
    return emitter;
};