/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var restApis = {
    //添加外出申请
    addBusinessWhileApply: '/rest/base/v1/workflow/businesstripawhile',
    //通过或者驳回申请
    approveApplyPassOrReject: '/rest/base/v1/workflow/businesstripawhile/approve',
    //修改外出申请的时间
    updateBusinessWhileCustomerTime: '/rest/base/v1/workflow/businesstripawhile/:id'
};
exports.restUrls = restApis;

//添加外出申请
exports.addBusinessWhileApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addBusinessWhileApply,
            req: req,
            res: res
        }, req.body);
};
//批准或驳回审批
exports.approveApplyPassOrReject = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveApplyPassOrReject,
            req: req,
            res: res
        }, req.body);
};
exports.updateBusinessWhileCustomerTime = function(req, res) {
    let bodyData = req.body;
    let applyId = bodyData.applyId;
    delete bodyData.applyId;
    return restUtil.authRest.put({
        url: restApis.updateBusinessWhileCustomerTime.replace(':id', applyId),
        req: req,
        res: res
    }, bodyData);
};
