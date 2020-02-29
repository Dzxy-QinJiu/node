/**
 * Created by hzl on 2020/2/29.
 */

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
// 获取已奖励的线索数量
exports.getRewardedCluesCount = (req, res) => {
    return restUtil.authRest.get(
        {
            // TODO url 需要替换
            url: '/rest/base/v1/rewarded/clue',
            req: req,
            res: res
        }, null);
};