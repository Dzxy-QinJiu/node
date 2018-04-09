/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
var crmService = require("../service/crm-manage-service");
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
function templateFile(res, example, filename) {
    var example = Buffer.concat([new Buffer("\xEF\xBB\xBF", "binary"), new Buffer(example)]);
    res.setHeader("Content-disposition", "attachement; filename=" + filename);
    res.setHeader("Content-Type", "application/csv");
    res.write(example);
    res.end();
}

var customerModel = {
    "user_id": "string",
    "user_name": "string",
    "apps": [
        "string"
    ],
    "name": "string",
    "start_time": "2016-03-04T02:24:51.011Z",
    "last_contact_time": "2016-03-04T02:24:51.011Z",
    "province": "string",
    "city": "string",
    "county": "string",
    "address": "string",
    "industry": "string",
    "remarks": "string",
    "sales_team": "string",
    "sales_stages": {},
    "app_user_ids": [
        "string"
    ],
    "contract_amount": 0,
    "gross_profit": 0,
    "extensionRecord": "string",
    "contacts": [
        {
            "def_contancts": "string",
            "name": "string",
            "role": "string",
            "phone": [
                "string"
            ],
            "mphone": [
                "string"
            ],
            "qq": "string",
            "email": "string",
            "weChat": "string",
            "department": "string",
            "position": "string"
        }
    ],
    "sales_opportunities": []
};

/*
 * show customer list handler.
 */
exports.getCurCustomers = function (req, res) {
    crmService.getCustomerList(req, res)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (err) {
        res.json(err.message);
    });
};
//获取客户的用列表
exports.getCrmUserList = function (req, res) {
    crmService.getCrmUserList(req, res, req.query)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};

//根据客户名获取行政级别
exports.getAdministrativeLevel = function (req, res) {
    crmService.getAdministrativeLevel(req, res, encodeURI(req.query.name))
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//获取筛选面板的行业列表
exports.getFilterIndustries = function (req, res) {
    crmService.getFilterIndustries(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//获取筛选面板的销售角色列表
exports.getFilterSalesRoleList = function (req, res) {
    crmService.getFilterSalesRoleList(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//获取筛选面板的地域列表
exports.getFilterProvinces = function (req, res) {
    crmService.getFilterProvinces(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err.message);
    });
};
//获取阶段标签列表
exports.getStageTagList = function (req, res) {
    crmService.getStageTagList(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err && err.message);
    });
};
//获取竞品列表
exports.getCompetitorList = function (req, res) {
    crmService.getCompetitorList(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err && err.message);
    });
};
//客户名、联系人电话唯一性的验证
exports.checkOnlyCustomer = function (req, res) {
    crmService.checkOnlyCustomer(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//根据客户id获取客户信息
exports.getCustomerById = function (req, res) {
    let customerId = req.params.customer_id;
    crmService.getCustomerById(req, res, customerId)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取重复客户
exports.getRepeatCustomerList = function (req, res) {
    crmService.getRepeatCustomerList(req, res, req.query)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//通过重复客户的客户id获取重复客户
exports.getRepeatCustomerById = function (req, res) {
    crmService.getRepeatCustomerById(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//删除重复的客户
exports.deleteRepeatCustomer = function (req, res) {
    let customerIdArray = JSON.parse(req.body.ids);
    crmService.deleteRepeatCustomer(req, res, customerIdArray)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//合并重复的客户
exports.mergeRepeatCustomer = function (req, res) {
    let mergeObj = {customer: JSON.parse(req.body.customer), delete_ids: JSON.parse(req.body.delete_ids)};
    crmService.mergeRepeatCustomer(req, res, mergeObj)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.addCustomer = function (req, res) {
    var newCus = req.body;
    newCus.contacts0_phone = [newCus.contacts0_phone];
    newCus.contacts = [{}];
    for (var p in newCus) {
        if (p.indexOf('contacts0') > -1) {
            var arr = p.split('_');
            newCus.contacts[0][arr[1]] = newCus[p];
            delete newCus[p];
        }
    }
    newCus.contacts[0].def_contancts = "true";
    crmService.addCustomer(req, res, newCus)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.deleteCustomer = function (req, res) {
    var ids = JSON.parse(req.body.ids);
    crmService.deleteCustomer(req, res, ids)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (err) {
        res.json(err.message);
    });
};

exports.updateCustomer = function (req, res) {
    var newCus = JSON.parse(req.body.newCus);
    crmService.updateCustomer(req, res, newCus)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err && err.message);
    });
};

function getEditBasicPromise(req, res, editBasicService, newCustomer, title) {
    return new Promise((resolve, reject) => {
        editBasicService(req, res, newCustomer, req.params.auth_type)
            .on("success", function (data) {
                restLogger.info(`修改客户${title}成功（customer = ${JSON.stringify(newCustomer)}）`);
                resolve(data);
            }).on("error", function (codeMessage) {
                restLogger.info(`修改客户${title}失败（customer_id=${JSON.stringify(newCustomer)}）`);
                reject(codeMessage && codeMessage.message);
            }
        );
    })
}
exports.editBasicInfo = function (req, res) {
    let promises = [];
    let newCustomer = req.body;
    //所有需要修改的属性对应的key
    let keys = Object.keys(newCustomer);
    //修改了行政级别
    if (keys.indexOf("administrative_level") != -1) {
        promises.push(getEditBasicPromise(req, res, crmService.updateAdministrativeLevel, newCustomer, "行政级别"));
    }
    //修改了行业
    if (keys.indexOf("industry") != -1) {
        promises.push(getEditBasicPromise(req, res, crmService.updateIndustry, newCustomer, "行业"));
    }
    //修改了地域
    if (keys.indexOf("province") != -1) {
        promises.push(getEditBasicPromise(req, res, crmService.updateRegion, newCustomer, "地域"));
    }
    //修改了详细地址
    if (keys.indexOf("address") != -1) {
        promises.push(getEditBasicPromise(req, res, crmService.updateDetailAddress, newCustomer, "详细地址"));
    }
    //修改了备注
    if (keys.indexOf("remarks") != -1) {
        promises.push(getEditBasicPromise(req, res, crmService.updateComment, newCustomer, "备注"));
    }
    return Promise.all(promises).then(function (data) {
        res.status(200).json(data);
    }, function (errorMsg) {
        res.status(500).json(errorMsg);
    });
};

//转出客户的处理
exports.transferCustomer = function (req, res) {
    crmService.transferCustomer(req, res, req.body)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (err) {
        res.status(500).json(err && err.message);
    });
};

exports.getCustomerList = function (req, res) {
    crmManageServic.getCustomerList(req, res).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

/*
 * show dynamic list handler.
 */
exports.getDynamicList = function (req, res) {
    var customer_id = req.params.customer_id;
    crmService.getDynamicList(req, res, customer_id)
        .on("success", function (data) {
            res.json(data.result);
        }).on("error", function (err) {
        res.json(err.message);
    });
};

/*
 * 查询客户
 */
exports.queryCustomer = function (req, res) {
    var reqData = req.body.reqData || req.body.data;
    var condition = JSON.parse(reqData);
    crmService.queryCustomer(req, res, condition)
        .on("success", function (data) {
            res.status(200).json(data);
        })
        .on("error", function (err) {
            res.status(500).json(err.message);
        });
};
// 处理上传文件
exports.uploadCustomers = function (req, res) {
    //调用上传请求服务
    crmService.uploadCustomers(req, res)
        .on("success", function (data) {
            res.json(data.result);
        })
        .on("error", function (err) {
            res.json(err.message);
        });
};

// 处理导入客户模板文件
exports.getCrmTemplate = function (req, res) {
    var example = "手机号码,电话号码,客户名称,销售人员(填写分机),添加时间,其他电话,地址,备注,销售团队,项目预算," +
        "联系人,QQ,邮箱,联系人角色,部门,职位,竞争对手,联系记录,下次联系时间,所属省份(必填),项目阶段(必填),行业\n" +
        "18057331777,51265238850,浙江优选网络科技有限公司,8009,2016/1/29  13:22:39,,,了解产品,,,邱总,240953334," +
        "240953334@qq.com,关键人,信息科技部,副经理,,,2016/2/4 14:00,浙江省,信息阶段,企业\n" +
        "18306357808,6357364708,莘县地税局,8009,2016/9/18  10:10:28,,,10/10上门沟通,,,徐主任,540256834," +
        "pxfybgs@163.com,信息科主任,信息科技部,,,,,山东省,意向阶段,税务局\n";
    var filename = "crm_tmpl.csv";
    templateFile(res, example, filename);
};


// 拨打电话
exports.callOut = function (req, res) {
    crmService.callOut(req, res, req.body).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取电话座机号
exports.getUserPhoneNumber = function (req, res) {
    crmService.getUserPhoneNumber(req, res, req.params).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
