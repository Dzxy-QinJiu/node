/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
"use strict";
var clueCustomerService = require("../service/clue-customer-service");
var path = require("path");
//获取线索客户列表
exports.getClueCustomerList = function(req, res) {
    clueCustomerService.getClueCustomerList(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        })
        .on("error", function(err) {
            res.status(500).json(err.message);
        });
};
//获取线索来源
exports.getClueSource = function(req, res) {
    clueCustomerService.getClueSource(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};

//获取线索渠道
exports.getClueChannel = function(req, res) {
    clueCustomerService.getClueChannel(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};
//获取线索分类
exports.getClueClassify = function(req, res) {
    clueCustomerService.getClueClassify(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};

//添加或者更新跟进内容
exports.addCluecustomerTrace = function(req, res) {
    clueCustomerService.addCluecustomerTrace(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};
//把线索客户分配给对应的销售
exports.distributeCluecustomerToSale = function(req, res) {
    clueCustomerService.distributeCluecustomerToSale(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};
//修改更新线索客户的详情
exports.updateCluecustomerDetail = function(req, res) {
    clueCustomerService.updateCluecustomerDetail(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};
//线索名、电话唯一性验证
exports.checkOnlySalesClue=function(req, res) {
    clueCustomerService.checkOnlySalesClue(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};
//将线索和客户进行关联
exports.relateClueAndCustomer = function(req, res) {
    clueCustomerService.relateClueAndCustomer(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};
// 处理导入线索模板文件
exports.getClueTemplate = function(req, res) {
    var filePath = path.resolve(__dirname, "../../tpl/clue_temp.xls");
    res.download(filePath);
};

exports.uploadClues = function(req, res) {
    //调用上传请求服务
    clueCustomerService.uploadClues(req, res)
        .on("success", function(data) {
            res.json(data.result);
        })
        .on("error", function(err) {
            res.json(err.message);
        });
};
exports.confirmUploadClues = function(req, res) {
    clueCustomerService.confirmUploadClues(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        })
        .on("error", function(err) {
            res.status(500).json(err.message);
        });
};
exports.deleteRepeatClue = function(req, res) {
    clueCustomerService.deleteRepeatClue(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        })
        .on("error", function(err) {
            res.status(500).json(err.message);
        });
};
//获取线索统计
exports.getClueAnalysis = function(req, res) {
    clueCustomerService.getClueAnalysis(req, res)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(err) {
            res.status(500).json(err.message);
        });
};
