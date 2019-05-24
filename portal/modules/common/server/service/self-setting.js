/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/20.
 */
//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var restApis = {
    //添加自定义流程
    selfSettingWorkFlow: '/rest/base/v1/workflow/config',
    //删除自定义流程
    deleteSelfSettingWorkFlow: '/rest/base/v1/workflow/config/:id',
    //保存流程规则
    saveSelfSettingWorkFlowRules: '/rest/base/v1/workflow/config/deploy',
    //自定义流程的启动
    saveSelfSettingApply: '/rest/base/v1/workflow/customiz/apply',
    //自定义流程的审批
    approveSelfSettingApply: '/base/v1/workflow/customiz/approve'


};
exports.restUrls = restApis;
//添加自定义流程
exports.addSelfSettingWorkFlow = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.selfSettingWorkFlow,
            req: req,
            res: res
        }, req.body);
};
//修改自定义流程
exports.editSelfSettingWorkFlow = function(req, res) {

    return restUtil.authRest.put(
        {
            url: restApis.selfSettingWorkFlow,
            req: req,
            res: res
        }, req.body);
};
//删除自定义流程
exports.deleteSelfSettingWorkFlow = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.deleteSelfSettingWorkFlow.replace(':id',req.params.id),
            req: req,
            res: res
        }, null);
};
exports.saveSelfSettingWorkFlowRules = function(req, res, formData) {
    return restUtil.authRest.post(
        {
            url: restApis.saveSelfSettingWorkFlowRules,
            req: req,
            res: res,
            formData: formData,
            timeout: uploadTimeOut,
        }, null);
};
//添加自定义申请
exports.addSelfSettingApply = function(req, res) {
    var detail = req.body.detail;
    if (_.isArray(detail)){
        req.body.detail = {},
            _.forEach(detail,(item,index) => {
                req.body.detail['' + index] = item;
            });
    }
    return restUtil.authRest.post(
        {
            url: restApis.saveSelfSettingApply,
            req: req,
            res: res
        }, req.body);
};
exports.approveSelfSettingApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveSelfSettingApply,
            req: req,
            res: res
        }, req.body);
};