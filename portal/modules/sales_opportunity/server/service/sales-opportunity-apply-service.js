/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var restApis = {
    //添加销售机会申请
    addSalesOpportunityApply: '/rest/base/v1/workflow/businessopportunities',
    //查询所有的销售机会申请
    allWorkFlowApplyList: '/rest/base/v1/workflow/applylist',
    //通过或者驳回申请
    approveSalesOpportunityApplyPassOrReject: '/rest/base/v1/workflow/businessopportunities/approve',
    //获取申请的状态
    getApplyStatusById: '/rest/base/v1/workflow/status',
};
exports.restUrls = restApis;
//获取所有的销售机会申请
exports.getAllSalesOpportunityApplyList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.allWorkFlowApplyList,
            req: req,
            res: res
        }, req.query);
};

//添加销售机会申请
exports.addSalesOpportunityApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addSalesOpportunityApply,
            req: req,
            res: res
        }, req.body);
};

//批准或驳回审批
exports.approveSalesOpportunityApplyPassOrReject = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveSalesOpportunityApplyPassOrReject,
            req: req,
            res: res
        }, req.body);
};
//获取销售机会申请的状态
exports.getSalesOpportunityApplyStatusById = function(req, res) {
    return restUtil.authRest.get(
        {
            url: restApis.getApplyStatusById,
            req: req,
            res: res
        }, req.query);
};
