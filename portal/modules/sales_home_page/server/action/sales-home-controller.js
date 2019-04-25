/**
 * Created by wangliping on 2016/9/6.
 */
'use strict';


//销售主页服务
var salesHomeService = require('../service/sales-home-service');

//获取销售对应的通话状态
exports.getSalesCallStatus = function(req, res) {
    salesHomeService.getSalesCallStatus(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取销售-客户列表
exports.getSalesCustomer = function(req, res) {
    salesHomeService.getSalesCustomer(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取销售-电话列表
exports.getSalesPhone = function(req, res) {
    salesHomeService.getSalesPhone(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取销售-用户列表
exports.getSalesUser = function(req, res) {
    salesHomeService.getSalesUser(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取销售-合同列表
exports.getSalesContract = function(req, res) {
    salesHomeService.getSalesContract(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/**
 * 获取不同应用即将过期的试用、正式用户列表
 */
exports.getExpireUser = function(req, res) {
    salesHomeService.getExpireUser(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取网站的个性化设置
exports.getWebsiteConfig = function(req, res) {
    salesHomeService.getWebsiteConfig(req, res).on('success', function(data) {
        //如果之前账号未进行过个性化设置，会返回204
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//对网站进行个性化设置
exports.setWebsiteConfig = function(req, res) {
    salesHomeService.setWebsiteConfig(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取回访列表
exports.getCallBack = function(req, res) {
    salesHomeService.getCallBack(req, res, req.params, req.body, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 批准或驳回审批
exports.approveMemberApplyPassOrReject = (req, res) => {
    salesHomeService.approveMemberApplyPassOrReject(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
