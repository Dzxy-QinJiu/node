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
//我审批过的申请列表
exports.getApplyListApprovedByMe = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/workflow/applylist/self/approved',
            req: req,
            res: res
        }, req.query);
};
//查询某个审批现在的节点位置
exports.getApplyTaskNode = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/workflow/task',
            req: req,
            res: res
        }, req.query);
};
//根据审批的id获取审批的详情
// exports.getApplyDetailById = function(req, res) {
//     return restUtil.authRest.get(
//         {
//             url: '/rest/base/v1/workflow/detail',
//             req: req,
//             res: res
//         }, req.query);
// };