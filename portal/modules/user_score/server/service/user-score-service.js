
'use strict';

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');

const restApis = {
    //获取用户评分配置指标列表
    getUserScoreIndicator: '/rest/rule/sales_auto/config/user_score/rule/config',
    //查询参与度规则
    getUserEngagementRule: '/rest/rule/sales_auto/config/user_engagement/rule',
    //获取用户评分
    getUserScoreLists: '/rest/rule/sales_auto/config/user_score/rule',
    //修改参与度评分的状态
    updateEngagementStatus: '/rest/rule/sales_auto/config/user_engagement/rule/status'
};
//获取用戶评分的规则
exports.getUserScoreIndicator = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.getUserScoreIndicator,
            req: req,
            res: res
        }, null);
};
//获取用户参与度
exports.getUserEngagementRule = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.getUserEngagementRule,
            req: req,
            res: res
        }, null);
};
//保存用户参与度
exports.saveUserEngagementRule = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.getUserEngagementRule,
            req: req,
            res: res
        }, req.body);
};
//获取用户评分配置指标列表
exports.getUserScoreLists = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.getUserScoreLists,
            req: req,
            res: res
        }, null);
};
//更新用户评分
exports.saveUserScoreLists = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.getUserScoreLists,
            req: req,
            res: res
        }, req.body);
};
exports.updateEngagementStatus = (req, res) => {
    return restUtil.authRest.put(
        {
            url: restApis.updateEngagementStatus,
            req: req,
            res: res
        }, req.body);
};