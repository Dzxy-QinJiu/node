/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';
var crmService = require('../service/crm-manage-service');
var _ = require('lodash');
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
let BackendIntl = require('../../../../lib/utils/backend_intl');

function templateFile(res, example, filename) {
    var example = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(example)]);
    res.setHeader('Content-disposition', 'attachement; filename=' + encodeURIComponent(filename));
    res.setHeader('Content-Type', 'application/csv');
    res.write(example);
    res.end();
}

var customerModel = {
    'user_id': 'string',
    'user_name': 'string',
    'apps': [
        'string'
    ],
    'name': 'string',
    'start_time': '2016-03-04T02:24:51.011Z',
    'last_contact_time': '2016-03-04T02:24:51.011Z',
    'province': 'string',
    'city': 'string',
    'county': 'string',
    'address': 'string',
    'industry': 'string',
    'remarks': 'string',
    'sales_team': 'string',
    'sales_stages': {},
    'app_user_ids': [
        'string'
    ],
    'contract_amount': 0,
    'gross_profit': 0,
    'extensionRecord': 'string',
    'contacts': [
        {
            'def_contancts': 'string',
            'name': 'string',
            'role': 'string',
            'phone': [
                'string'
            ],
            'mphone': [
                'string'
            ],
            'qq': 'string',
            'email': 'string',
            'weChat': 'string',
            'department': 'string',
            'position': 'string'
        }
    ],
    'sales_opportunities': []
};

/*
 * show customer list handler.
 */
exports.getCurCustomers = function(req, res) {
    crmService.getCustomerList(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.json(err.message);
        });
};

//获取回收站中的客户列表
exports.getRecycleBinCustomers = function(req, res) {
    crmService.getRecycleBinCustomers(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

//获取客户的历史分数
exports.getHistoryScoreList = function(req, res) {
    crmService.getHistoryScoreList(req, res, req.query)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

//根据客户名获取行政级别
exports.getAdministrativeLevel = function(req, res) {
    crmService.getAdministrativeLevel(req, res, encodeURI(req.query.name))
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};
//获取筛选面板的行业列表
exports.getFilterIndustries = function(req, res) {
    crmService.getFilterIndustries(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};
//获取筛选面板的销售角色列表
exports.getFilterSalesRoleList = function(req, res) {
    crmService.getFilterSalesRoleList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};
//获取筛选面板的地域列表
exports.getFilterProvinces = function(req, res) {
    crmService.getFilterProvinces(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};
//获取阶段标签列表
exports.getStageTagList = function(req, res) {
    crmService.getStageTagList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取系统标签列表
exports.getSystemLabelsList = function(req, res) {
    crmService.getSystemLabelsList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取竞品列表
exports.getCompetitorList = function(req, res) {
    crmService.getCompetitorList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取筛选面板的负责人列表
exports.getOwnerList = function(req, res) {
    crmService.getOwnerList(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

//客户名、联系人电话唯一性的验证
exports.checkOnlyCustomer = function(req, res) {
    crmService.checkOnlyCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//根据客户id获取客户信息
exports.getCustomerById = function(req, res) {
    let customerId = req.params.customer_id;
    crmService.getCustomerById(req, res, customerId)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//获取重复客户
exports.getRepeatCustomerList = function(req, res) {
    crmService.getRepeatCustomerList(req, res, req.query)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//通过重复客户的客户id获取重复客户
exports.getRepeatCustomerById = function(req, res) {
    crmService.getRepeatCustomerById(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//删除重复的客户
exports.deleteRepeatCustomer = function(req, res) {
    let customerIdArray = JSON.parse(req.body.ids);
    crmService.deleteRepeatCustomer(req, res, customerIdArray)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//合并重复的客户
exports.mergeRepeatCustomer = function(req, res) {
    let mergeObj = {customer: JSON.parse(req.body.customer), delete_customers: JSON.parse(req.body.delete_customers)};
    crmService.mergeRepeatCustomer(req, res, mergeObj)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//恢复回收站中的客户
exports.recoveryCustomer = function(req, res) {
    crmService.recoveryCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//删除回收站中的客户
exports.deleteCustomerBak = function(req, res) {
    crmService.deleteCustomerBak(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

exports.addCustomer = function(req, res) {
    var newCus = req.body;
    //不是数组，转换为数组
    if (newCus.contacts0_phone && !_.isArray(newCus.contacts0_phone)) {
        newCus.contacts0_phone = [newCus.contacts0_phone];
    }
    //不是改版后的contacts数据格式，是以前的contract0_phone这种数据格式，需要兼容下以前的
    if(!_.has(newCus, 'contacts') && newCus.contacts0_phone) {
        newCus.contacts = [{}];
        for (var p in newCus) {
            if (p.indexOf('contacts0') > -1) {
                var arr = p.split('_');
                newCus.contacts[0][arr[1]] = newCus[p];
                delete newCus[p];
            }
        }
    }
    newCus.contacts[0].def_contancts = 'true';
    crmService.addCustomer(req, res, newCus)
        .on('success', function(data) {
            //后端没有返回联系人的数据，需要用前端的数据组合
            if (_.get(data, 'result[0]')) {
                data.result[0].contacts = newCus.contacts;
            }
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
exports.addCustomerByClue = function(req, res) {
    crmService.addCustomerByClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
//小程序中使用
exports.editCustomer = function(req, res) {
    crmService.editCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

exports.deleteCustomer = function(req, res) {
    crmService.deleteCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

exports.updateCustomer = function(req, res) {
    var newCus = JSON.parse(req.body.newCus);
    crmService.updateCustomer(req, res, newCus)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

//转出客户的处理
exports.transferCustomer = function(req, res) {
    crmService.transferCustomer(req, res, req.body)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

exports.getCustomerList = function(req, res) {
    crmService.getCustomerList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

/*
 * show dynamic list handler.
 */
exports.getDynamicList = function(req, res) {
    var customer_id = req.params.customer_id;
    crmService.getDynamicList(req, res, customer_id)
        .on('success', function(data) {
            res.status(200).json(data.result);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

/*
 * 查询客户
 */
exports.queryCustomer = function(req, res) {
    crmService.queryCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err.message);
        });
};
// 处理上传文件
exports.uploadCustomers = function(req, res) {
    var form = new multiparty.Form();
    //开始处理上传请求
    form.parse(req, function(err, fields, files) {
        // 获取上传文件的临时路径
        let tmpPath = files['customers'][0].path;
        // 文件内容为空的处理
        let file_size = files['customers'][0].size;
        if (file_size === 0) {
            res.json(false);
            return;
        }
        // 文件不为空的处理
        let formData = {
            attachments: [fs.createReadStream(tmpPath)]
        };
        //调用上传请求服务
        crmService.uploadCustomers(req, res, formData)
            .on('success', function(data) {
                res.json(data.result);
            })
            .on('error', function(err) {
                res.json(err && err.message);
            });
    });

};

// 处理导入客户模板文件
exports.getCrmTemplate = function(req, res) {
    let isCsv = req.query.is_csv;//是否是用csv格式的模板
    const backendIntl = new BackendIntl(req);
    const filename = backendIntl.get('sales.home.customer', '客户');
    if (isCsv) {
        const example = '客户名称（必填）,联系人,电话号码（必填，多个用空格分隔）,QQ（多个用空格分隔）,邮箱（多个用空格分隔）,联系人角色,部门,职位, 负责人,跟进记录,添加时间（格式必须为yyyy/MM/dd）,行业,所属省份,地址,竞品（多个用空格分隔）,备注\n' +
            '山东客套智能科技有限公司,梁总,15666666666 05312345678,,curtao@qq.com,关键人,信息科技部,总经理,销售1,负责人不在下次再联系,2016/1/29,企业,山东省,,了解产品,,';
        templateFile(res, example, filename + '.csv');
    } else {
        const filePath = path.resolve(__dirname, '../tpl/crm_tpl.xls');
        res.download(filePath, filename + '.xls');
    }
};

// 拨打电话
exports.callOut = function(req, res) {
    crmService.callOut(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//标识能否继续添加客户
exports.getCustomerLimit = function(req, res) {
    crmService.getCustomerLimit(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//修改客户阶段标签
exports.editCustomerStage = function(req, res) {
    crmService.editCustomerStage(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//只修改客户的所属团队
exports.onlyEditCustomerTeam = function(req, res) {
    crmService.onlyEditCustomerTeam(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取客户所属销售及联合跟进人
exports.getSalesByCustomerId = function(req, res) {
    crmService.getSalesByCustomerId(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//修改客户的联合跟进人
exports.editSecondSales = function(req, res) {
    crmService.editSecondSales(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//释放客户
exports.releaseCustomer = function(req, res) {
    crmService.releaseCustomer(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取客户池中的客户
exports.getPoolCustomer = function(req, res) {
    crmService.getPoolCustomer(req, res).on('success', function(data) {
        if (_.get(data, 'list.length')) {
            //客户池中需要去掉联系方式
            data.list = _.map(data.list, item => {
                delete item.origin_contacts;
                return item;
            });
        }
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//提取客户
exports.extractCustomer = function(req, res) {
    crmService.extractCustomer(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取客户池中聚合的筛选项
exports.getCustomerPoolFilterItems = function(req, res) {
    crmService.getCustomerPoolFilterItems(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 通过团队id获取客户阶段（销售流程)
exports.getCustomerStageByTeamId = (req, res) => {
    crmService.getCustomerStageByTeamId(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 验证是否有权限处理跟进人
exports.checkCustomerUpdateUser = (req, res) => {
    crmService.checkCustomerUpdateUser(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 是否有权限处理联合跟进人
exports.checkCustomerJoinUser = (req, res) => {
    crmService.checkCustomerJoinUser(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};