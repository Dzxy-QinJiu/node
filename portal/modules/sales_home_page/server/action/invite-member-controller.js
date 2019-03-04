/**
 * Created by hzl on 2019/2/28.
 */

'use strict';
// 邀请成员功能模块
const inviteMemberService = require('../service/invite-member-service');

// 邀请成员
exports.inviteMember = (req, res) => {
    inviteMemberService.inviteMember(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//姓名唯一性验证
exports.checkOnlyName = (req, res) => {
    inviteMemberService.checkOnlyName(req, res).on('success', (data) => {
        if (data && data.nickname) {
            // 姓名已存在，返回true
            res.status(200).json(true);
        } else {
            // 姓名不存在，返回false
            res.status(200).json(false);
        }
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//用户名唯一性验证
exports.checkOnlyUserName = (req, res) => {
    inviteMemberService.checkOnlyUserName(req, res).on('success', (data) => {
        if (data && data.username) {
            // 用户名已存在，返回true
            res.status(200).json(true);
        } else {
            // 用户名不存在，返回false
            res.status(200).json(false);
        }
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//邮箱唯一性验证
exports.checkOnlyEmail = (req, res) => {
    inviteMemberService.checkOnlyEmail(req, res).on('success', (data) => {
        if (data && data.email) {
            // 邮箱已存在，返回true
            res.status(200).json(true);
        } else {
            // 邮箱不存在，返回false
            res.status(200).json(false);
        }
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};