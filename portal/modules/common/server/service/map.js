/**
 * 根据角色获取成员列表
 */

let restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
let getAreaInfoUrl = '/rest/geo/service/v1/geo/search/eefung/all';
//根据角色，获取成员列表
exports.getAreaInfo = function(req, res) {
    return restUtil.authRest.get({
        url: getAreaInfoUrl,
        req: req,
        res: res
    }, null);
};