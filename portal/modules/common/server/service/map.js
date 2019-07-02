/**
 * 获取查询所有行政区域规划信息
 */

let restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
let getAreaInfoUrl = '/rest/geo/service/v1/geo/search/eefung/all';
///获取查询所有行政区域规划信息
exports.getAreaInfo = function(req, res) {
    return restUtil.authRest.get({
        url: getAreaInfoUrl,
        req: req,
        res: res
    }, null);
};