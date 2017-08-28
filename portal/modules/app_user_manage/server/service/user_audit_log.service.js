"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var Promise = require('bluebird');
var EventEmitter = require("events").EventEmitter;
var _ = require('underscore');

var AppUserRestApis = {
    //获取用户审计日志列表
    getUserLogs: "/rest/analysis/auditlog/v1/app/drop_down_load",
    // 获取单个用户审计日志列表
    getSingleAuditLogList : "/rest/analysis/auditlog/v1/app/userdetail/",
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
};

exports.urls = AppUserRestApis;

// 获取用户审计日志
exports.getUserLogList = function(req, res, obj){
    return restUtil.authRest.get({
        url: AppUserRestApis.getUserLogs,
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

// 用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录频次统计）
exports.getUserLoginInfo = function(req, res, obj){
    let emitter = new EventEmitter();
    let urlList = [{'duration':AppUserRestApis.getLoginDuration }, // 登录时长
        {'count': AppUserRestApis.getLoginCount }, // 登录次数
        {'first': AppUserRestApis.getFirstLoginTime }, // 首次登录
        {'last': AppUserRestApis.getLastLoginTime },  // 最后一次登录
        {'loginDuration': AppUserRestApis.getLoginDurationGraph }, // 登录时长统计
        {'loginCount': AppUserRestApis.getLoginFrequency } // 登录频次统计
    ];
    let loginList = [];
    _.each(urlList, (item) => {
        for (let props in item){
            loginList.push(handleLoginInfo(req, res, obj, item[props], props));
        }
    });
    Promise.all(loginList).then((results) => {
        emitter.emit("success" , results);
    }).catch( (errorMsg)=>{
        emitter.emit("error" , errorMsg);
    } );
    return emitter;
};

function handleLoginInfo (req, res, obj, url, param){
    let tempObj = _.clone(obj);
    let app_id = tempObj.appid;
    let user_id = tempObj.user_id;
    delete tempObj.appid;
    delete tempObj.user_id;
    return new Promise( (resolve, reject) => {
        return restUtil.authRest.get({
            url: url
                .replace(":app_id", app_id )
                .replace(":user_id",user_id),
            req: req,
            res: res
        }, tempObj, {
            success: function (eventEmitter, data) {
                if(data) {
                    let obj = {};
                    obj[param] = data;
                    resolve(obj);
                } else {
                    reject({message : "获取登录信息失败！"});
                }
            },
            error : function(eventEmitter , errorDesc) {
                reject(errorDesc.message);
            }
        });
    } );
}
