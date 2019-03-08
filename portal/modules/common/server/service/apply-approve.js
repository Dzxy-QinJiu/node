/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/10.
 */
let restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
exports.getNextCandidate = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/workflow/next/candidates',
            req: req,
            res: res
        }, req.query);
};
exports.addNewCandidate = function(req, res) {
    return restUtil.authRest.post(
        {
            url: '/rest/base/v1/workflow/taskcandidateusers',
            req: req,
            res: res
        }, req.body);
};
exports.addUserApplyNewCandidate = function(req, res) {
    return restUtil.authRest.post(
        {
            url: '/rest/base/v1/message/apply/taskcandidateusers',
            req: req,
            res: res
        }, req.body);
};
//待我审批的用户列表
exports.getMyUserApplyWorkList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/message/applylist/worklist',
            req: req,
            res: res
        }, null);
};
//我审批过的申请列表
exports.getApplyListApprovedByMe = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/workflow/applylist/self/approved',
            req: req,
            res: res
        }, req.query);
};