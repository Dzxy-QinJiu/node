var path = require('path');
var auth = require(path.join(portal_root_path, './lib/utils/auth'));
var _ = require('lodash');
var restLogger = require('../../../lib/utils/logger').getLogger('rest');
var pageLogger = require('../../../lib/utils/logger').getLogger('page');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var EventEmitter = require('events');
let BackendIntl = require('../../../lib/utils/backend_intl');

//获取用户权限
function getPrivileges(req) {
    var userInfo = auth.getUser(req);
    var userPrivileges = userInfo.privileges;
    return userPrivileges;
}

//获取数据的promise
function getDataPromise(req, res, url, pathParams, queryObj) {
    //url中的参数处理
    if (pathParams) {
        for (let key in pathParams) {
            url += '/' + pathParams[key];
        }
    }
    let resultObj = {errorData: null, successData: null};
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: url,
                req: req,
                res: res
            }, queryObj, {
                success: function(eventEmitter, data) {
                    resultObj.successData = data;
                    resolve(resultObj);
                },
                error: function(eventEmitter, errorObj) {
                    resultObj.errorData = errorObj;
                    resolve(resultObj);
                }
            });
    });
}

//获取用户信息
exports.getUserInfo = function(req, res, userId) {
    var emitter = new EventEmitter();
    //with_extentions:去掉额外信息的获取，只取基本信息，这样速度快
    var queryObj = {with_extentions: false};
    //获取登录用户的基本信息
    let getUserBasicInfo = getDataPromise(req, res, userInfoRestApis.getUserInfo, {userId: userId}, queryObj);
    //获取登录用户的角色信息
    let getUserRole = getDataPromise(req, res, userInfoRestApis.getMemberRoles);
    let promiseList = [getUserBasicInfo, getUserRole];
    let userPrivileges = getPrivileges(req);
    //是否有获取所有团队数据的权限
    let hasGetAllTeamPrivilege = userPrivileges.indexOf('GET_TEAM_LIST_ALL') !== -1;
    //没有获取所有团队数据的权限,通过获取我所在的团队及下级团队来判断是否是普通销售
    if (!hasGetAllTeamPrivilege) {
        promiseList.push(getDataPromise(req, res, userInfoRestApis.getMyTeamWithSubteams));
    }
    Promise.all(promiseList).then(resultList => {
        let userInfoResult = _.get(resultList, '[0]', {});
        //成功获取用户信息
        if (userInfoResult.successData) {
            let userData = userInfoResult.successData;
            //角色标识的数组['realm_manager', 'sales', ...]
            userData.roles = _.get(resultList, '[1].successData', []);
            //是否是普通销售
            if (hasGetAllTeamPrivilege) {//管理员或运营人员，肯定不是普通销售
                userData.isCommonSales = false;
            } else {//普通销售、销售主管、销售总监等，通过我所在的团队及下级团队来判断是否是普通销售
                let teamTreeList = _.get(resultList, '[2].successData', []);
                userData.isCommonSales = getIsCommonSalesByTeams(userData.user_id, teamTreeList);
            }
            emitter.emit('success', userData);
        } else if (userInfoResult.errorData) {//只有用户信息获取失败时，才返回失败信息
            emitter.emit('error', userInfoResult.errorData);
        } else {//未获取到用户信息或返回状态为204时
            let backendIntl = new BackendIntl(req);
            emitter.emit('error', {httpCode: 500, message: backendIntl.get('user.get.user.info.null', '获取不到登录用户的信息')});
        }
    }).catch(errorObj => {
        emitter.emit('error', errorObj);
    });
    return emitter;
};

/**
 * 通过我所在的团队及下级团队来判断是否是普通销售
 * teamTreeList=[{group_id, group_name, child_groups:[{group_id,group_name,child_groups:...}]}]
 * teamTreeList销售所在团队只会返回一个（管理员或运营人员获取所有的时候才会返回多个）
 */
function getIsCommonSalesByTeams(userId, teamTreeList) {
    let isCommonSales = false;//是否是普通销售
    //是否是普通销售的判断（所在团队无下级团队，并且不是销售主管、舆情秘书的即为：普通销售）
    if (_.isArray(teamTreeList) && teamTreeList[0]) {
        let myTeam = teamTreeList[0];//销售所在团队
        // 销售所在团队是否有子团队
        let hasChildGroups = _.isArray(myTeam.child_groups) && myTeam.child_groups.length > 0;
        //没有下级团队时
        if (!hasChildGroups) {
            //是否是销售主管的判断
            let isOwner = myTeam.owner_id && myTeam.owner_id === userId ? true : false;
            //当前销售是团队的舆情秘书
            let isManager = _.isArray(myTeam.manager_ids) && myTeam.manager_ids.indexOf(userId) !== -1;
            //不是销售主管也不是舆情秘书的即为普通销售
            if (!isOwner && !isManager) {
                isCommonSales = true;
            }
        }
    }
    return isCommonSales;
}

//邮箱激活接口，用于发邮件时，点击激活连接的跳转
exports.activeEmail = function(req, res, activeCode) {
    return restUtil.baseRest.get(
        {
            url: userInfoRestApis.activeEmail,
            req: req,
            res: res,
            json: false,
            headers: {accept: 'text/html'}
        }, {code: activeCode});
};
//获取用户语言
exports.getUserLanguage = function(req, res) {
    return restUtil.authRest.get(
        {
            url: userInfoRestApis.getUserLanguage,
            req: req,
            res: res
        }, null);
};
/**
 * 记录日志
 * @param req
 * @param res
 * @param message
 */
exports.recordLog = function(req, res, message) {
    pageLogger.info(message);
};
var userInfoRestApis = {
    getUserInfo: '/rest/base/v1/user/id',
    getMemberRoles: '/rest/base/v1/user/member/roles',
    activeEmail: '/rest/base/v1/user/email/confirm',
    getUserLanguage: '/rest/base/v1/user/member/language/setting',
    getMyTeamWithSubteams: '/rest/base/v1/group/teams/tree/self'
};

exports.getPrivileges = getPrivileges;
