/**
 * Created by hzl on 2020/2/29.
 */

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
// 获取已奖励的线索数量
exports.getRewardedCluesCount = (req, res) => {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/user/memberaward/lead',
            req: req,
            res: res
        }, req.query);
};