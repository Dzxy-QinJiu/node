/**
 * Created by hzl  on 2020/2/29.
 */

const clueService = require('../service/clue');

// 获取已奖励的线索数量
exports.getRewardedCluesCount = (req, res) => {
    clueService.getRewardedCluesCount(req, res).on('success' , (data) => {
        res.status(200).json(data);
    }).on('error' , (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 检测手机号的状态
exports.checkPhoneStatus = (req, res) => {
    clueService.checkPhoneStatus(req, res).on('success' , (data) => {
        res.status(200).json(data);
    }).on('error' , (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
