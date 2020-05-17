/**
 * Created by hzl on 2020/2/29.
 */

module.exports = {
    module: 'common/server/action/clue',
    routes: [{
        // 获取已奖励的线索数量
        'method': 'get',
        'path': '/rest/rewarded/clues/count',
        'handler': 'getRewardedCluesCount',
        'passport': {
            'needLogin': true
        }
    }, {
        // 检测手机号的状态
        'method': 'post',
        'path': '/rest/check/phone/status',
        'handler': 'checkPhoneStatus',
        'passport': {
            'needLogin': true
        }
    }]
};