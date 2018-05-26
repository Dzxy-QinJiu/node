/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";

var authorityManageServic = require("../service/authority-manage-service");
var Promise = require('bluebird');

/*
 * list authority handler.
 */
exports.getAuthorityList = function(req, res) {
    var clientID = req.params.client_id;
    authorityManageServic.getAuthorityList(req, res, clientID)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};


//修改权限分组名称
exports.editAuthorityGroupName = function(req, res) {

    var authorityGroup = {
        classifyName: encodeURI(req.body.classifyName),
        authorityIDs: req.body.authorityIDs ? req.body.authorityIDs.split(",") : []
    };
    authorityManageServic.editAuthorityGroupName(req, res, authorityGroup)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};

/**
 * add authority handler
 */
exports.addAuthority = function(req, res) {
    var authoritys = req.body;
    authoritys = authoritys.map(function(authority) {
        return {
            classify_name: authority.classifyName,
            client_id: authority.clientId,
            permission_apis: authority.permissionApis,
            permission_name: authority.permissionName,
            permission_define: authority.permissionDefine,
            fact_class: authority.permissionType,
            permission_datas: authority.permissionDatas,
            realm_id: authority.realmId
        };
    });
    authorityManageServic.addAuthority(req, res, authoritys)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );

};
/**
 * edit authority handler
 */
exports.editAuthority = function(req, res) {
    var authority = {
        permission_id: req.body.permissionId,
        permission_name: req.body.permissionName,
        permission_define: req.body.permissionDefine,
        permission_apis: JSON.parse(req.body.permissionApis),
        fact_class: req.body.permissionType,
        permission_datas: JSON.parse(req.body.permissionDatas),
        classify_name: req.body.classifyName,
        client_id: req.body.clientId
    };
    authorityManageServic.editAuthority(req, res, authority)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );

};

/**
 * delete authority handler
 */

exports.deleteAuthority = function(req, res) {
    var count = 10;
    var authorityIds = req.body.authorityIds;
    var times = Math.ceil(authorityIds.length / count);
    var promises = [];
    for (var i = 0; i < times; i++) {
        promises.push(new Promise((resolve, reject) => {
            var ids = authorityIds.slice(i * count, (i + 1) * count).join(",");
            authorityManageServic.deleteAuthority(req, res, ids)
                .on("success", function(data) {
                    resolve(data);
                }).on("error", function(codeMessage) {
                    reject(codeMessage && codeMessage.message);
                }
                );
        }));
    }
    return Promise.all(promises).then(function(data) {
        res.status(200).json(data);
    }, function(errorMsg) {
        res.status(500).json(errorMsg);
    });
};

