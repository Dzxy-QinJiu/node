/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/20.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var restApis = {
    //添加自定义流程
    selfSettingWorkFlow: '/rest/base/v1/workflow/config',
    //删除自定义流程
    deleteSelfSettingWorkFlow: '/re/base/v1/workflow/config/:id'
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