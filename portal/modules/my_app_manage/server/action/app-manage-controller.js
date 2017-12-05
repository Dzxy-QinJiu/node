/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";

require('../nock');
var multiparty = require('multiparty');
var fs = require("fs");
var moment = require("moment");
//域管理服务
var appManageServic = require("../service/app-manage-service");

// 文件名乱码的处理
function handleFileName(req, res, filename) {
    var userAgent = (req.headers['user-agent'] || '').toLowerCase();
    res.set('Content-Type', 'application/octet-stream;charset=utf-8');

    if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
        res.setHeader('Content-Disposition',
            'attachment; filename=' + encodeURIComponent(filename));
    } else if (userAgent.indexOf('firefox') >= 0) {
        res.setHeader('Content-Disposition',
            'attachment; filename*="utf8\'\'' + encodeURIComponent(filename) + '"');
    } else {
        res.setHeader('Content-Disposition',
            'attachment; filename=' + new Buffer(filename).toString('binary'));
    }
}

//获取用户信息
exports.getMyAppList = function (req, res) {
    var params = {};
    var curPage = req.query.cur_page, pageSize = req.query.page_size, filterContent = req.query.search_content;
    if (curPage) {
        params.current_page = curPage;
    }
    if (pageSize) {
        params.page_size = pageSize;
    } else {
        params.page_size = 1000;
    }
    if (filterContent) {
        params.filter_content = filterContent;
    }
    appManageServic.getMyAppList(req, res, params === {} ? null : params)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getCurAppById = function (req, res) {
    appManageServic.getCurAppById(req, res, req.params.app_id).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * edit app handler
 */
exports.editApp = function (req, res) {
    appManageServic.editApp(req, res, req.body)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
};
/**
 * refresh app secret
 */
exports.refreshAppSecret = function (req, res) {
    appManageServic.refreshAppSecret(req, res, req.params.app_id)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
};

//修改应用到期时间
exports.updateExpireDate = function (req, res) {
    appManageServic.updateExpireDate(req, res, req.body)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
};

// 导出权限
exports.exportAuthorityList = function (req, res) {
    var clientID = req.params.client_id;
    var clientAppName = "";
    // 以年月日的格式命名文件名比如：20161018
    var date = moment(new Date()).format("YYYYMMDD");
    appManageServic.getCurAppById(req, res, clientID).on("success", function (data) {
        clientAppName = data.name;
        appManageServic.exportAuthorityList(req, res, clientID)
            .on("success", function (data) {
                // 导出文件的命名方式role-appName-date
                var filename = 'auth-' + clientAppName + '-' + date + '.json';
                // 数据
                var authorityData = JSON.stringify(data, null, '\t');
                // 文件名乱码的处理
                handleFileName(req, res, filename);
                res.write(authorityData);
                res.end();
            }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
    }).on("error", function () {
        res.status(500).json("导出权限失败");
    });
};

// 导出权限模板文件
exports.exportAuthModuleFilename = function (req, res) {
    var example = [
        {
            "classify_name": "应用管理",
            "permission_apis": {
                "v1/application/roles/*": "GET",
                "v1/role/export/*": "GET"
            },
            "permission_define": "USER_INFO_MYAPP_ROLE_LIST",
            "permission_name": "查看我的应用中的角色"
        },
        {
            "classify_name": "应用管理",
            "permission_apis": {
                "v1/role": "PUT"
            },
            "permission_define": "USER_INFO_MYAPP_ROLE_EDIT",
            "permission_name": "修改我的应用中的角色"
        },
        {
            "classify_name": "用户管理",
            "permission_apis": {
                "v1/application/permissions/*": "GET",
                "v1/user/approve_grants": "POST"
            },
            "permission_define": "APP_USER_APPLY_APPROVAL",
            "permission_name": "审批申请消息"
        }
    ];
    var data = JSON.stringify(example, null, '\t');
    res.setHeader('Content-disposition', 'attachment;filename=auth_template.json');
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF8';
    res.write(data);
    res.end();
};

/**
 * 导入（上传）权限json文件
 */
exports.uploadAuthority = function (req, res) {

    var client_id = req.params.client_id;

    var form = new multiparty.Form();

    //开始处理上传请求
    form.parse(req, function (err, fields, files) {
        var tmpPath = files['import_authority'][0].path;
        var data = fs.readFileSync(tmpPath, 'utf8');
        var importData = JSON.parse(data);
        appManageServic.uploadAuthority(req, res, client_id, importData).on("success", function (message) {
            res.json(message);
        }).on("error", function (ret) {
            res.status(500).json(ret);
        });
        // 删除临时文件
        fs.unlinkSync(tmpPath);
    });
};

// 导出角色
exports.exportRoleList = function (req, res) {
    var clientID = req.params.client_id;
    var clientAppName = "";
    // 以年月日的格式命名文件名比如：20161018
    var date = moment(new Date()).format("YYYYMMDD");
    appManageServic.getCurAppById(req, res, clientID).on("success", function (data) {
        clientAppName = data.name;
        appManageServic.exportRoleList(req, res, clientID)
            .on("success", function (data) {
                // 导出文件的命名方式role-appName-date
                var filename = 'role-' + clientAppName + '-' + date + '.json';
                // 数据
                var roleData = JSON.stringify(data, null, '\t');
                // 文件名乱码的处理
                handleFileName(req, res, filename);
                res.write(roleData);
                res.end();
            }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
    }).on("error", function () {
        res.status(500).json("导出角色失败");
    });
};

// 导出角色模板文件
exports.exportRoleModuleFilename = function (req, res) {
    var example = [
        {
            "role_name": "应用管理员",
            "permissions": [
                "USER_ANALYSIS_INDUSTRY",
                "APP_USER_LIST"
            ]
        },
        {
            "role_name": "域管理员",
            "permissions": [
                "USER_MANAGE_USE",
                "USER_ANALYSIS_INDUSTRY",
                "NOTIFICATION_APPLYFOR_LIST"
            ]
        }
    ];
    var data = JSON.stringify(example, null, '\t');
    res.setHeader('Content-disposition', 'attachment;filename=role_template.json');
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF8';
    res.write(data);
    res.end();
};


/**
 *  导入（上传）角色json文件
 */
exports.uploadRole = function (req, res) {

    var client_id = req.params.client_id;

    var form = new multiparty.Form();

    //开始处理上传请求
    form.parse(req, function (err, fields, files) {
        var tmpPath = files['import_role'][0].path;
        var data = fs.readFileSync(tmpPath, 'utf8');
        var importData = JSON.parse(data);

        appManageServic.uploadRole(req, res, client_id, importData).on("success", function (message) {
            res.json(message);
        }).on("error", function (ret) {
            res.status(500).json(ret);
        });
        // 删除临时文件
        fs.unlinkSync(tmpPath);
    });
};
exports.getCurAppKey = function (req, res) {
    appManageServic.getCurAppKey(req, res, req.params.app_id).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};