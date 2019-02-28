/**
 * Created by hzl on 2019/2/28.
 */

'use strict';
// 邀请成员功能模块
const inviteService = require('../service/invite-service');

// 邀请成员
exports.inviteMember = (req, res) => {
    inviteService.inviteMember(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//用户名唯一性验证
exports.checkOnlyUserName = (req, res) => {
    inviteService.checkOnlyUserName(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//邮箱唯一性验证
exports.checkOnlyEmail = (req, res) => {
    inviteService.checkOnlyEmail(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};