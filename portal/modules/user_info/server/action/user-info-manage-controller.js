/**
 * Created by xiaojinfeng on  2015/12/25 11:11 .
 */
'use strict';
var userInfoManageServic = require('../service/user-info-manage-service');
var oldPwd = '88881234';

//获取用户信息
exports.getUserInfo = (req, res) => {
    userInfoManageServic.getUserInfo(req, res)
        .on('success', (data) => {
            res.status(200).json(data);
        }).on('error', (codeMessage) => {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//获取登录日志
exports.getLogList = function(req, res) {
    userInfoManageServic.getLogList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//激活邮箱
exports.activeUserEmail = function(req, res) {
    userInfoManageServic.activeUserEmail(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//修改用户信息
exports.editUserInfo = function(req, res) {
    userInfoManageServic.editUserInfo(req, res, req.body)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
exports.setUserLanguage = function(req, res) {
    userInfoManageServic.setUserLanguage(req, res, req.body)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//校验原密码是否正确
exports.checkUserInfoPwd = function(req, res) {

    var passwd = req.query.passwd;
    var flag = false;

    if (oldPwd) {
        if (oldPwd === passwd) {
            flag = true;
        }
    }

    res.json({flag: flag});

    //var passWd = req.query.passwd;
    //userInfoManageServic.checkUserInfoPwd(req, res, passWd)
    //    .on("success", function (data) {
    //        res.status(200).json(data);
    //    }).on("error", function (codeMessage) {
    //    res.json(codeMessage && codeMessage.message);
    //});
};

//修改用户密码
exports.editUserInfoPwd = function(req, res) {

    var object = {
        userId: req.body.userId,
        userInfo: {
            old_password: req.body.passwd,
            new_password: req.body.newPasswd
        }
    };

    userInfoManageServic.editUserInfoPwd(req, res, object)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage.message);
        });

};

//获得所管理的安全域
exports.getManagedRealm = function(req, res) {
    userInfoManageServic.getManagedRealm(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//设置订阅通知邮件
exports.setSubscribeEmail = function(req, res) {
    var config = req.body.config;
    userInfoManageServic.setSubscribeEmail(req, res, config).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取短信验证码
exports.getUserInfoPhoneCode = function(req, res) {
    userInfoManageServic.getUserInfoPhoneCode(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//绑定用户的手机号
exports.bindUserInfoPhone = function(req, res) {
    userInfoManageServic.bindUserInfoPhone(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

// 获取用户交易记录
exports.getUserTradeRecord = (req, res) => {
    userInfoManageServic.getUserTradeRecord(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (errorObj) => {
        res.status(500).json(errorObj && errorObj.message);
    });
};