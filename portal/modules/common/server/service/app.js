/**
 * ajax url定义
 */
var auth = require('../../../../lib/utils/auth');
var urls = {
    getGrantApplications: '/rest/base/v1/products/list',
    getAddedTeam: 'rest/analysis/user/v1/:auth_type/added/team', //获取新增用户的团队统计
    // 获取当前应用的在线用户的地域数据
    getOnLineUserZone: '/rest/analysis/user/v1/online/onlineStatistics/:client_id/:select_mode',
    //获取应用的默认配置
    getAppConfigPromise: '/rest/base/v1/application/extra/grantinfos',
    //通过id获取应用详细信息
    getCurAppById: '/rest/base/v1/application/id',
    //获取产品集成的配置
    getIntegrationConfig: '/rest/base/v1/products/integration/config',
    // 获取该组织的用户查询条件
    queryUserCondition: '/rest/base/v1/realm/userquery/condition',
};
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var appDto = require('../dto/app');
var _ = require('lodash');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
let BackendIntl = require('../../../../lib/utils/backend_intl');
const commonUtil = require('../../../../lib/utils/common-utils');

//获取集成配置
exports.getIntegrationConfig = function(req, res) {
    return restUtil.authRest.get({
        url: urls.getIntegrationConfig,
        req: req,
        res: res
    }, {}, {
        success: function(emitter, resultObj) {
            //返回集成类型（matomo、oplate、uem-默认），过滤掉其他暂时不用的数据
            emitter.emit('success', {
                type: _.get(resultObj, 'name', ''),
                create_time: _.get(resultObj, 'create_time', ''),
                server: _.get(resultObj, 'server', ''),
                authToken: _.get(resultObj, 'authToken', '')
            });
        }
    });
};

//根据当前用户数据权限，获取应用列表
exports.getGrantApplications = function(req, res) {
    //什么都不传时，获取所有的产品列表（由于是下拉加载的接口，所以取所有时需要传一个比较大的page_size:1000）
    let queryObj = _.isEmpty(req.query) ? {page_size: 1000, integration: false} : req.query;
    return restUtil.authRest.get({
        url: urls.getGrantApplications,
        req: req,
        res: res
    }, queryObj, {
        success: function(emitter,data) {
            let list = _.get(data, 'list', []);
            let responseList = _.map(list, originApp => {
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

//获取用户查询条件
exports.queryUserCondition = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.queryUserCondition,
            req: req,
            res: res
        }, null);
};