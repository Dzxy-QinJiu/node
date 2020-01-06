
var path = require('path');
var auth = require(path.join(portal_root_path, './lib/utils/auth'));
var _ = require('lodash');
var restLogger = require('../../../lib/utils/logger').getLogger('rest');
var pageLogger = require('../../../lib/utils/logger').getLogger('page');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var EventEmitter = require('events');
let BackendIntl = require('../../../lib/utils/backend_intl');
import publicPrivilegeConst from '../../../public/privilege-const';
import privilegeConstCommon from '../../../modules/common/public/privilege-const';

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
    let user = auth.getUser(req);
    var emitter = new EventEmitter();
    //with_extentions:去掉额外信息的获取，只取基本信息，这样速度快
    var queryObj = {with_extentions: false};
    // 获取用户公告参数
    const noticeQueryObj = {
        application_id: _.get(global.config, 'loginParams.clientId'),
        page_size: 1,
        page_num: 1};
    //获取登录用户的基本信息
    let getUserBasicInfo = getDataPromise(req, res, userInfoRestApis.getUserInfo, {userId: userId}, queryObj);
    //获取登录用户的角色信息
    let getUserRole = getDataPromise(req, res, userInfoRestApis.getMemberRoles);
    //获取登录用户的引导流程
    let getUserGuideCOnfigs = getDataPromise(req, res, userInfoRestApis.getGuideConfig);
    //获取网站个性化设置
    let getWebsiteConfig = getDataPromise(req, res, userInfoRestApis.getWebsiteConfig);
    // 获取用户的公告信息
    let getUserNotice = promiseList.push(getDataPromise(req, res, userInfoRestApis.getUserNotice, '', noticeQueryObj));
    let promiseList = [getUserBasicInfo, getUserRole, getUserGuideCOnfigs, getWebsiteConfig, getUserNotice];
    let userPrivileges = getPrivileges(req);
    //是否有获取所有团队数据的权限
    let hasGetAllTeamPrivilege = userPrivileges.indexOf(publicPrivilegeConst.GET_TEAM_LIST_ALL) !== -1;
    //是否有获取流程配置的权限
    let hasWorkFlowPrivilege = userPrivileges.indexOf(privilegeConstCommon.WORKFLOW_BASE_PERMISSION) !== -1;
    //没有获取所有团队数据的权限,通过获取我所在的团队及下级团队来判断是否是普通销售
    if (!hasGetAllTeamPrivilege) {
        promiseList.push(getDataPromise(req, res, userInfoRestApis.getMyTeamWithSubteams));
        if(hasWorkFlowPrivilege){
            //获取登录用户已经配置过的流程
            promiseList.push(getDataPromise(req, res, userInfoRestApis.getUserWorkFlowConfigs,'',{page_size: 1000}));
        }
    }else if(hasWorkFlowPrivilege){
        promiseList.push(getDataPromise(req, res, userInfoRestApis.getUserWorkFlowConfigs,'',{page_size: 1000}));
    }

    Promise.all(promiseList).then(resultList => {
        let userInfoResult = _.get(resultList, '[0]', {});
        //成功获取用户信息
        if (userInfoResult.successData) {
            let userData = userInfoResult.successData;
            //角色标识的数组['realm_manager', 'sales', ...]
            userData.roles = _.get(resultList, '[1].successData', []);
            //引导流程
            userData.guideConfig = _.get(resultList,'[2].successData',[]);
            //网站个性化
            userData.websiteConfig = _.get(resultList, '[3].successData', {});
            // 升级公告
            userData.upgradeNoice = _.get(resultList, '[4].successData', {});
            //是否是普通销售
            if (hasGetAllTeamPrivilege) {//管理员或运营人员，肯定不是普通销售
                userData.isCommonSales = false;
                //已经配置过的流程
                if(hasWorkFlowPrivilege){
                    userData.workFlowConfigs = handleWorkFlowData(_.get(resultList, '[5].successData', []));
                }

            } else {//普通销售、销售主管、销售总监等，通过我所在的团队及下级团队来判断是否是普通销售
                let teamTreeList = _.get(resultList, '[5].successData', []);
                userData.isCommonSales = getIsCommonSalesByTeams(userData.user_id, teamTreeList);
                //已经配置过的流程
                if(hasWorkFlowPrivilege){
                    userData.workFlowConfigs = handleWorkFlowData(_.get(resultList, '[6].successData', []));
                }
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
    } else {//没有团队的销售也是普通销售
        isCommonSales = true;

    }
    return isCommonSales;
}


function handleWorkFlowData(list) {
    list = list || [];
    let result = [];
    list.forEach((item) => {
        result.push({
            applyRulesAndSetting: _.get(item, 'applyRulesAndSetting',{}),
            customiz: _.get(item, 'customiz',true),
            customiz_form: _.get(item, 'customiz_form',[]),
            description: _.get(item, 'description',''),
            id: _.get(item, 'id',''),
            type: _.get(item, 'type',''),
            notify_configs: _.get(item, 'notify_configs',[]),
        });

    });

    return result;
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
//根据手机号获取用户所在区域
exports.getUserAreaData = function(req, res) {
    return restUtil.baseRest.get({
        url: userInfoRestApis.getAreaByPhone.replace(':phone', req.params.phone),
        req: req,
        res: res,
        headers: {
            realm: global.config.loginParams.realm
        }
    }, null);
};
var baseUrl = 'http://dataservice.curtao.com';
var userInfoRestApis = {
    getUserInfo: '/rest/base/v1/user/id',
    getMemberRoles: '/rest/base/v1/user/member/roles',
    activeEmail: '/rest/base/v1/user/email/confirm',
    getUserLanguage: '/rest/base/v1/user/member/language/setting',
    getMyTeamWithSubteams: '/rest/base/v1/group/teams/tree/self',
    getUserWorkFlowConfigs: '/rest/base/v1/workflow/configs',
    getOrganizationInfoById: '/rest/base/v1/realm/organization',
    getGuideConfig: '/rest/base/v1/user/member/guide',
    getAreaByPhone: baseUrl + '/rest/es/v2/es/phone_location/:phone',
    getWebsiteConfig: '/rest/base/v1/user/website/config',
    getUserNotice: '/rest/base/v1/application/upgrade/notice',
};

exports.getPrivileges = getPrivileges;
