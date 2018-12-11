/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var restApis = {
    //添加舆情报送申请
    addReportSendApply: '/rest/base/v1/workflow/opinionreport',
    //通过或者驳回申请
    approveLeaveApplyPassOrReject: '/rest/base/v1/workflow/leave/approve',

};
exports.restUrls = restApis;
//添加请假申请
exports.addReportSendApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addReportSendApply,
            req: req,
            res: res
        }, req.body);
};
//批准或驳回审批
exports.approveReportSendApplyPassOrReject = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveReportSendApplyPassOrReject,
            req: req,
            res: res
        }, req.body);
};
