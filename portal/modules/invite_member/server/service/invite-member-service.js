/**
 * Created by hzl on 2019/3/8.
 */

'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);

var inviteMemberRestApis = {
    // 邀请成员接口
    inviteMember: '/rest/base/v1/workflow/memberinvite',
    //邀请成员属性（用户名、邮箱、电话）唯一性验证的url
    checkOnlyInviteMember: '/rest/base/v1/user/member/:key/:value/unique',
};

exports.urls = inviteMemberRestApis;

// 邀请成员
exports.inviteMember = (req, res) => {
    return restUtil.authRest.post(
        {
            url: inviteMemberRestApis.inviteMember,
            req: req,
            res: res
        }, req.body);
};

//姓名唯一性验证
exports.checkOnlyName = (req, res) => {
    let name = req.params.name;
    return restUtil.authRest.get(
        {
            url: inviteMemberRestApis.checkOnlyInviteMember.replace(':key', 'nickname').replace(':value', name),
            req: req,
            res: res
        }, null);
};

//用户名唯一性验证
exports.checkOnlyUserName = (req, res) => {
    let username = req.params.username;
    return restUtil.authRest.get(
        {
            url: inviteMemberRestApis.checkOnlyInviteMember.replace(':key', 'username').replace(':value', username),
            req: req,
            res: res
        }, null);
};

//邮箱唯一性验证
exports.checkOnlyEmail = (req, res) => {
    let email = req.params.email;
    return restUtil.authRest.get(
        {
            url: inviteMemberRestApis.checkOnlyInviteMember.replace(':key', 'email').replace(':value', email),
            req: req,
            res: res
        }, req.query);
};