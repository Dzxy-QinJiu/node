/**
 * Created by hzl on 2019/3/5.
 */
var MemberApplyService = require('../service/member-apply-service');
var moment = require('moment');
var _ = require('lodash');

exports.getAllMemberApplyList = function(req, res) {
    MemberApplyService.getAllMemberApplyList(req, res).on('success', function(data) {
        data = handleNodata(data);
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
function handleNodata(data) {
    if (!data){
        data = {
            list: [],
            total: 0
        };
    }
    return data;
}

exports.getMemberApplyComments = function(req, res) {
    MemberApplyService.getMemberApplyComments(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addMemberApplyComments = function(req, res) {
    MemberApplyService.addMemberApplyComments(req, res).on('success', function(replyData) {
        if (_.isObject(replyData)) {
            //创建回复数据，直接添加到store的回复数组后面
            let replyTime = replyData.comment_time ? replyData.comment_time : moment().valueOf();
            let replyItem = {
                user_id: replyData.user_id || '',
                user_name: replyData.user_name || '',
                comment: replyData.comment || '',
                comment_time: replyTime,
                nick_name: replyData.nick_name || ''
            };
            res.status(200).json(replyItem);
        }else{
            res.status(200).json({});
        }
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveMemberApplyPassOrReject = function(req, res) {
    MemberApplyService.approveMemberApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.getMemberApplyStatusById = function(req, res) {
    MemberApplyService.getMemberApplyStatusById(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//姓名唯一性验证
exports.checkOnlyName = (req, res) => {
    MemberApplyService.checkOnlyName(req, res).on('success', (data) => {
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
 
//邮箱唯一性验证
exports.checkOnlyEmail = (req, res) => {
    MemberApplyService.checkOnlyEmail(req, res).on('success', (data) => {
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