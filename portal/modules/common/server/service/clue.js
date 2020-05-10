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

// 检测手机号的状态
exports.checkPhoneStatus = (req, res) => {
    return restUtil.authRest.post(
        {
            url: '/rest/company/v1/count/check/phone/status',
            req: req,
            res: res
        }, req.body);
};