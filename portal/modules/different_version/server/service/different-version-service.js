'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);


const differentVersionsRestApis = {
    getAllVersions: '/rest/versions/getall'
};

exports.urls = differentVersionsRestApis;

exports.getAllVersions = function(req, res) {
    return restUtil.authRest.get({
        url: differentVersionsRestApis.getAllVersions,
        req: req,
        res: res
    }, req.query);
};