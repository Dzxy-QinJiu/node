/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
"use strict";
var clueCustomerService = require("../service/clue-customer-service");
//获取线索客户列表
exports.getClueCustomerList = function (req, res) {
    clueCustomerService.getClueCustomerList(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        })
        .on("error", function (err) {
            res.status(500).json(err.message);
        });
};
//获取线索来源
exports.getClueSource = function (req, res) {
    clueCustomerService.getClueSource(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};

//获取线索渠道
exports.getClueChannel = function (req, res) {
    clueCustomerService.getClueChannel(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//获取线索分类
exports.getClueClassify = function (req, res) {
    clueCustomerService.getClueClassify(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};

//添加或者更新跟进内容
exports.addCluecustomerTrace = function (req, res) {
    clueCustomerService.addCluecustomerTrace(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//把线索客户分配给对应的销售
exports.distributeCluecustomerToSale = function (req, res) {
    clueCustomerService.distributeCluecustomerToSale(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//修改更新线索客户的详情
exports.updateCluecustomerDetail = function (req, res) {
    clueCustomerService.updateCluecustomerDetail(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//线索名、电话唯一性验证
exports.checkOnlySalesClue=function (req, res) {
    clueCustomerService.checkOnlySalesClue(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//将线索和客户进行关联
exports.relateClueAndCustomer = function (req, res) {
    clueCustomerService.relateClueAndCustomer(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
function templateFile(res, example, filename) {
    var example = Buffer.concat([new Buffer("\xEF\xBB\xBF", "binary"), new Buffer(example)]);
    res.setHeader("Content-disposition", "attachement; filename=" + filename);
    res.setHeader("Content-Type", "application/csv");
    res.write(example);
    res.end();
}
// 处理导入线索模板文件
exports.getClueTemplate = function (req, res) {
    var example = "日期,地区,线索名称,联系人,电话,QQ号码,线索来源,线索描述,接入渠道,跟进人,跟进内容\n" +
        "1.2,江苏,苏州科沃斯机器人有限公司,庾先生,13955558888,,百度,营销QQ咨询，想要试用系统。,识微营销QQ,王先生,已加微信，保护联系";
    var filename = "clue_tmpl.xls";
    templateFile(res, example, filename);
};

exports.uploadClues = function (req, res) {
    //调用上传请求服务
    clueCustomerService.uploadClues(req, res)
        .on("success", function (data) {
            res.json(data.result);
        })
        .on("error", function (err) {
            res.json(err.message);
        });
};
exports.confirmUploadClues = function (req, res) {
    clueCustomerService.confirmUploadClues(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        })
        .on("error", function (err) {
            res.status(500).json(err.message);
        });
};
