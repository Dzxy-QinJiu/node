'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);


const differentVersionsRestApis = {
    getAllVersions: '/system/management/organizationversions',
    getVersionFunctions: '/system/management/organizationversion'
};

exports.urls = differentVersionsRestApis;

exports.getAllVersions = function(req, res) {
    return restUtil.authRest.get({
        url: differentVersionsRestApis.getAllVersions,
        req: req,
        res: res
    }, req.query);
};
exports.getVersionFunctionsById = function(req, res) {
    return restUtil.authRest.get({
        url: differentVersionsRestApis.getVersionFunctions,
        req: req,
        res: res
    }, req.query);
};