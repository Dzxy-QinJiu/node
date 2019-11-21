/**
 * url定义
 */
var urls = {
    getOrganizationList: '/rest/base/v1/usergroup/list',
    changeOrganization: '/rest/base/v1/usergroup/user/:user_id/:group_id',
    // 获取组织电话系统配置
    getCallSystemConfig: '/rest//base/v1/realm/callsystemconfig',
    //完善个人试用信息
    updatePersonalTrialInfo: '/rest/base/v1/user/baseinfo'
};
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var organizationDto = require('../dto/organization');
var _ = require('lodash');
//根据当前用户数据权限，获取应用列表
exports.getOrganizationList = function(req,res,status) {
    return restUtil.authRest.get({
        url: urls.getOrganizationList,
        req: req,
        res: res
    },{
    },{
        success: function(emitter,list) {
            if(!_.isArray(list)) {
                list = [];
            }
            var responseList = list.map(function(organization) {
                return new organizationDto.Organization(organization);
            });
            emitter.emit('success' , responseList);
        }
    });
};

//修改用户所属组织
exports.changeOrganization = function(req,res,user_id,group_id) {
    return restUtil.authRest.put({
        url: urls.changeOrganization.replace(':user_id',user_id).replace(':group_id',group_id),
        req: req,
        res: res
    });
};

exports.getCallSystemConfig = function(req,res) {
    return restUtil.authRest.get({
        url: urls.getCallSystemConfig,
        req: req,
        res: res
    });
};

exports.updatePersonalTrialInfo = function(req,res) {
    return restUtil.authRest.put({
        url: urls.updatePersonalTrialInfo,
        req: req,
        res: res
    }, req.body);
};