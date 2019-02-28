/**
 * Created by hzl on 2019/2/28.
 */
/**
 * Created by hzl on 2019/2/27.
 */

'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);

var inviteRestApis = {
    // 邀请成员接口
    inviteMember: '/rest/open/resource/member/register',
    //邀请成员属性（用户名、邮箱、电话）唯一性验证的url
    checkOnlyInviteMember: '/rest/open/resource/invite/check',
};

exports.urls = inviteRestApis;

// 邀请成员
exports.inviteMember = (req, res) => {
    return restUtil.authRest.post(
        {
            url: inviteRestApis.inviteMember,
            req: req,
            res: res
        }, req.body);
};

//用户名唯一性验证
exports.checkOnlyUserName = (req, res) => {
    console.log('###############################',req.query);
    return restUtil.authRest.get(
        {
            url: inviteRestApis.checkOnlyInviteMember,
            req: req,
            res: res
        }, req.query);
};

//邮箱唯一性验证
exports.checkOnlyEmail = (req, res) => {
    return restUtil.authRest.get(
        {
            url: inviteRestApis.checkOnlyInviteMember,
            req: req,
            res: res
        }, req.query);
};