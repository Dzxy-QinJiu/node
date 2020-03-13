'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');

var cprRestApis = {
    // 获取客户标签 type: manager(管理员) user(非管理员)
    getCustomerLabel: '/rest/customer/v3/customer/term/:type/field/labels',
    // 根据团队获取客户阶段
    getCustomerStageByTeamId: '/rest/customer/v3/salesprocess/:team_id',
    // 获取客户池配置列表
    getCustomerPoolConfigs: '/customerpool/resource/configs',
    // 添加客户池配置
    addCustomerPoolConfig: '/customerpool/resource/config',
    // 更新客户池配置
    updateCustomerPoolConfig: '/customerpool/resource/config',
    // 删除客户池配置
    deleteCustomerPoolConfigById: '/customerpool/resource/config/:id',
    // 获取自动释放配置
    getCrpAutoReleaseConfigs: '/customerpool/resource/configs/autorelease',
    // 新增自动释放配置
    addCrpAutoReleaseConfig: '/customerpool/resource/config/autorelease',
    // 修改自动释放配置
    updateCrpAutoReleaseConfig: '/customerpool/resource/config/autorelease',
    // 删除自动释放配置
    deleteCrpAutoReleaseConfig: '/customerpool/resource/config/autorelease/:id',
};
exports.urls = cprRestApis;

//获取客户标签列表
exports.getCustomerLabel = function(req, res) {
    let url = cprRestApis.getCustomerLabel.replace(':type', req.params.type || 'manager');
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, req.body);
};

//获取客户标签列表
exports.getCustomerStage = function(req, res) {
    let url = cprRestApis.getCustomerStageByTeamId.replace(':team_id', req.params.team_id);
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null);
};

//获取客户池配置列表
exports.getCustomerPoolConfigs = function(req, res) {
    return restUtil.authRest.get(
        {
            url: cprRestApis.getCustomerPoolConfigs,
            req: req,
            res: res
        }, req.query);
};

//添加客户池配置列表
exports.addCustomerPoolConfig = function(req, res) {
    return restUtil.authRest.post(
        {
            url: cprRestApis.addCustomerPoolConfig,
            req: req,
            res: res
        }, req.body);
};

//更新客户池配置列表
exports.updateCustomerPoolConfig = function(req, res) {
    return restUtil.authRest.put(
        {
            url: cprRestApis.updateCustomerPoolConfig,
            req: req,
            res: res
        }, req.body);
};

//删除客户池配置列表
exports.deleteCustomerPoolConfig = function(req, res) {
    return restUtil.authRest.del(
        {
            url: cprRestApis.deleteCustomerPoolConfigById.replace(':id', req.params.id),
            req: req,
            res: res
        }, null);
};

//获取自动释放配置
exports.getCrpAutoReleaseConfigs = function(req, res) {
    return restUtil.authRest.get(
        {
            url: cprRestApis.getCrpAutoReleaseConfigs,
            req: req,
            res: res
        }, req.query);
};

//新增自动释放配置
exports.addCrpAutoReleaseConfig = function(req, res) {
    return restUtil.authRest.post(
        {
            url: cprRestApis.addCrpAutoReleaseConfig,
            req: req,
            res: res
        }, req.body);
};

//修改自动释放配置
exports.updateCrpAutoReleaseConfig = function(req, res) {
    return restUtil.authRest.put(
        {
            url: cprRestApis.updateCrpAutoReleaseConfig,
            req: req,
            res: res
        }, req.body);
};

//删除自动释放配置
exports.deleteCrpAutoReleaseConfig = function(req, res) {
    return restUtil.authRest.del(
        {
            url: cprRestApis.deleteCrpAutoReleaseConfig.replace(':id', req.params.id),
            req: req,
            res: res
        }, null);
};