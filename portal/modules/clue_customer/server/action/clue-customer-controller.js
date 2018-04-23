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
    var example = "手机号码,电话号码,客户名称,销售人员(填写分机),添加时间,其他电话,地址,备注,销售团队,项目预算," +
        "联系人,QQ,邮箱,联系人角色,部门,职位,竞争对手,联系记录,下次联系时间,所属省份(必填),项目阶段(必填),行业\n" +
        "18057331777,51265238850,浙江优选网络科技有限公司,8009,2016/1/29  13:22:39,,,了解产品,,,邱总,240953334," +
        "240953334@qq.com,关键人,信息科技部,副经理,,,2016/2/4 14:00,浙江省,信息阶段,企业\n" +
        "18306357808,6357364708,莘县地税局,8009,2016/9/18  10:10:28,,,10/10上门沟通,,,徐主任,540256834," +
        "pxfybgs@163.com,信息科主任,信息科技部,,,,,山东省,意向阶段,税务局\n";
    var filename = "clue_tmpl.csv";
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