
'use strict';

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');

const restApis = {
    //获取客户评分的等级
    getCustomerScoreRules: '/rest/rule/sales_auto/config/customer_level/rule',
    //获取客户等级
    getCustomerScoreLevel: '/rest/rule/sales_auto/config/customer_score/rule',
    //获取客户评分配置指标列表
    getCustomerScoreIndicator: '/rest/rule/sales_auto/config/customer_score/rule/config',
    //保存客户的相关参数
    saveCustomerRules: '/rest/rule/sales_auto/config/customer/rule',
};
//获取客户评分的规则
exports.getCustomerScoreRules = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.getCustomerScoreRules,
            req: req,
            res: res
        }, null);
};
//获取客户分数等级
exports.getCustomerScoreLevel = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.getCustomerScoreLevel,
            req: req,
            res: res
        }, null);
};
//获取客户评分配置指标列表
exports.getCustomerScoreIndicator = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.getCustomerScoreIndicator,
            req: req,
            res: res
        }, null);
};
//保存客户的相关规则
exports.saveCustomerRules = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.saveCustomerRules,
            req: req,
            res: res
        }, req.body);
};