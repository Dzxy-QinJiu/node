'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);

const applyTryRestApis = {
    postApplyTry: '/rest/base/v1/realm/version/upgrade/apply'
};

exports.urls = applyTryRestApis;

exports.postApplyTry = function(req, res) {
    return restUtil.authRest.post({
        url: applyTryRestApis.postApplyTry,
        req: req,
        res: res
    }, req.body);
};