
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
import {getDataPromise} from '../../../lib/utils/getDataPromise';

//获取用户权限
function getPrivileges(req) {
    var userInfo = auth.getUser(req);
    var userPrivileges = userInfo.privileges;
    return userPrivileges;
}

//获取用户信息
exports.getUserInfo = function(req, res) {
    let user = auth.getUser(req);
    var emitter = new EventEmitter();
    //获取登录用户的基本信息
    let getUserBasicInfo = getDataPromise(req, res, userInfoRestApis.getUserInfo, null, {
        //以下参数不传时，默认为true，都会获取
        with_role: false, //是否获取角色信息roles:[{role_id, role_name}]
        with_group: false,//是否获取团队信息team_id, team_name
        with_extentions: true//是否获取邮箱激活email_enable、国际化语言language_setting:{lang:EN}
    });
    // 获取用户的组织信息
    let getOrganization = getDataPromise(req, res, userInfoRestApis.getOrganization);
    let promiseList = [getUserBasicInfo, getOrganization];
    let userPrivileges = getPrivileges(req);
    //是否有获取所有团队数据的权限
    let hasGetAllTeamPrivilege = userPrivileges.indexOf(publicPrivilegeConst.GET_TEAM_LIST_ALL) !== -1;
    //没有获取所有团队数据的权限,通过获取我所在的团队及下级团队来判断是否是普通销售
    if (!hasGetAllTeamPrivilege) {
        promiseList.push(getDataPromise(req, res, userInfoRestApis.getMyTeamWithSubteams));
    }
    // 登录时已获取过网站个性化配置，此处就不用再获取了,只有刷新时才需要重新获取
    if (!req.session.websiteConfig) {
        //获取网站个性化设置
        promiseList.push(getDataPromise(req, res, userInfoRestApis.getWebsiteConfig));
    }
    Promise.all(promiseList).then(resultList => {
        let userInfoResult = _.get(resultList, '[0]', {});
        //成功获取用户信息
        if (userInfoResult.successData) {
            let userData = userInfoResult.successData;
            //用户组织信息
            userData.organization = _.get(resultList, '[1].successData', {});
            //是否是普通销售
            if (hasGetAllTeamPrivilege) {//管理员或运营人员，肯定不是普通销售
                userData.isCommonSales = false;
                if (!req.session.websiteConfig) {//刷新时，需要重新获取websiteConfig
                    //网站个性化
                    userData.websiteConfig = _.get(resultList, '[2].successData', {});
                }
            } else {//普通销售、销售主管、销售总监等，通过我所在的团队及下级团队来判断是否是普通销售
                let teamTreeList = _.get(resultList, '[2].successData', []);
                userData.isCommonSales = getIsCommonSalesByTeams(userData.user_id, teamTreeList);
                // 有团队时，赋值销售所在的团队信息
                if (_.get(teamTreeList, 'length')) {
                    userData.team_id = _.get(teamTreeList, '[0].group_id', '');
                    userData.team_name = _.get(teamTreeList, '[0].group_name', '');
                }
                //刷新时，需要重新获取websiteConfig
                if (!req.session.websiteConfig) {
                    //网站个性化
                    userData.websiteConfig = _.get(resultList, '[3].successData', {});
                }
            }
            // 登录时已获取过websiteConfig此处就不需要获取了，直接用session中存的
            if (req.session.websiteConfig) {
                userData.websiteConfig = req.session.websiteConfig;
                // 取完登录后的websiteConfig后，即可删掉session中的websiteConfig，为了刷新时可以重新获取最新数据
                delete req.session.websiteConfig;
                req.session.save();
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
            variable: _.get(item, 'variable',{}), // 审批后,修改分配销售
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
//设置网站个性化配置
exports.setWebsiteConfig = function(req, res, data) {
    return restUtil.authRest.post({
        url: userInfoRestApis.setWebsiteConfig,
        req: req,
        res: res
    }, data);
};
var baseUrl = 'http://dataservice.curtao.com';
var userInfoRestApis = {
    getUserInfo: '/rest/base/v1/user/member/self', // 登录用户信息
    getMemberRoles: '/rest/base/v1/user/member/roles',
    activeEmail: '/rest/base/v1/user/email/confirm222',
    getUserLanguage: '/rest/base/v1/user/member/language/setting',
    getMyTeamWithSubteams: '/rest/base/v1/group/teams/tree/self',
    getOrganizationInfoById: '/rest/base/v1/realm/organization',
    getGuideConfig: '/rest/base/v1/user/member/guide',
    getAreaByPhone: baseUrl + '/rest/es/v2/es/phone_location/:phone',
    getWebsiteConfig: '/rest/base/v1/user/website/config',
    getSalesRoleByMemberId: '/rest/base/v1/user/member/teamrole',
    //获取登录用户的组织信息
    getOrganization: '/rest/base/v1/user/member/organization',
    //设置网站个性化配置
    setWebsiteConfig: '/rest/base/v1/user/website/config/personnel',
};

exports.getPrivileges = getPrivileges;
