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
            url: 'http://172.19.104.11:3000/mock/23/base/v1/workflow/taskcandidateusers',
            req: req,
            res: res
        }, req.body);
};