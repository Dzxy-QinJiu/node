/**
 * ajax url定义
 */
var urls = {
    getGrantApplications: '/rest/base/v1/application/grant_applications',
    getMyApplications: '/rest/base/v1/user/manage_apps',
    getAddedTeam: 'rest/analysis/user/v1/:auth_type/added/team', //获取新增用户的团队统计
    // 获取当前应用的在线用户的地域数据
    getOnLineUserZone: '/rest/analysis/user/v1/online/onlineStatistics/:client_id/:select_mode',
    //获取应用的默认配置
    getAppConfigPromise: '/rest/base/v1/application/extra/grantinfos',
    //通过id获取应用详细信息
    getCurAppById: '/rest/base/v1/application/id'
};
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var appDto = require('../dto/app');
var _ = require('lodash');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;

//根据当前用户数据权限，获取应用列表
exports.getGrantApplications = function(req,res,status) {
    return restUtil.authRest.get({
        url: urls.getGrantApplications,
        req: req,
        res: res
    },{
        status: status
    },{
        success: function(emitter,list) {
            if(!_.isArray(list)) {
                list = [];
            }
            var responseList = list.map(function(originApp) {
                return new appDto.App(originApp);
            });
            emitter.emit('success' , responseList);
        }
    });
};
//根据当前用户数据权限，获取“我的应用”列表
exports.getMyApplications = function(req,res) {
    return restUtil.authRest.get({
        url: urls.getMyApplications,
        req: req,
        res: res
    },{},{
        success: function(emitter,result) {
            //处理数据
            var dataObj = _.isObject(result) ? result : {};
            var list = _.isArray(dataObj.data) ? dataObj.data : [];
            if(!_.isArray(list)) {
                list = [];
            }
            var responseList = list.map(function(originApp) {
                return new appDto.App(originApp);
            });
            emitter.emit('success' , responseList);
        }
    });
};

function getTeamCount(req, res, queryParams, type) {
    let tempParams = _.clone(queryParams);
    let url = urls.getAddedTeam;
    if (tempParams.authType) {//common、manager
        url = url.replace(':auth_type', tempParams.authType);
    }
    delete tempParams.authType;
    tempParams.type = type;
    return new Promise( (resolve, reject) => {
        restUtil.authRest.get(
            {
                url: url,
                req: req,
                res: res
            }, tempParams , {
                success: (eventEmitter, result) => {
                    resolve(result);
                },
                error: (eventEmitter, errorDesc) => {
                    reject(errorDesc.message);
                }
            });
    });
}

// 获取当前应用的新增用户的团队数据
exports.getAddedTeam = (req, res, queryParams) => {
    var emitter = new EventEmitter();
    Promise.all([getTeamCount(req, res, queryParams, '试用用户'), getTeamCount(req, res, queryParams, '正式用户')]).then( (result) => {
        let data = handleTeamData(result[0], result[1]);
        emitter.emit('success', data);
    }, (errorMsg) => {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};

function handleTeamData(teamTrail, teamOfficial) {
    let length1 = teamTrail.length;
    let length2 = teamOfficial.length;

    if (length1 === 0 && length2 === 0) {
        return [];
    } else if (length2 === 0) {
        return _.map( teamTrail, (trailItem) => {
            trailItem.official = 0;
            return trailItem;
        } );
    } else {
        return _.map( teamTrail, (trailItem) => {
            let findData = _.find(teamOfficial, (officalItem) => {
                return officalItem.name === trailItem.name;
            });
            if (findData) {
                trailItem.official = findData.count;
            } else {
                trailItem.official = 0;
            }
            return trailItem;
        } );
    }
}

// 获取当前应用的在线用户的地域数据
exports.getOnLineUserZone = (req, res, queryParams) => {
    return restUtil.authRest.get(
        {
            url: urls.getOnLineUserZone.replace(':client_id', queryParams.client_id).replace(':select_mode', queryParams.select_mode),
            req: req,
            res: res
        });
};

//获取各应用的默认配置
exports.getAppsDefaultConfig = (req, res, queryParams) => {
    return restUtil.authRest.get(
        {
            url: urls.getAppConfigPromise,
            req: req,
            res: res
        },queryParams);
};

//通过id获取应用的详细信息
exports.getCurAppById = function(req, res, appId) {
    return restUtil.authRest.get(
        {
            url: urls.getCurAppById + '/' + appId,
            req: req,
            res: res
        }, null, {
            success: function(eventEmitter, data) {
                //处理数据
                if (data) {
                    data = appDto.toFrontObject(data);
                }
                eventEmitter.emit('success', data);
            }
        });
};