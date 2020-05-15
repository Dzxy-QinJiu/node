/**
 * Created by hzl on 2020/2/29.
 */

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
const apiUrls = {
    //空号检测
    checkPhoneStatus: '/rest/company/v1/count/check/mobile/status',
    //推荐线索空号检测
    checkCluePhoneStatus: '/rest/company/v1/count/check/mobile/drop_down_load',

};
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
    let url = apiUrls.checkPhoneStatus;
    let data = req.body;
    if(_.isEqual(req.query.type, 'recommend-clue')) {//推荐线索查询手机号状态
        url = apiUrls.checkCluePhoneStatus;
        data = _.pick(req.body.check_params, ['ids']);
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, data);
};