/**
 * Created by xiaojinfeng on  2015/12/25 11:11 .
 */
"use strict";

var roleManageServic = require("../service/role-manage-service");

//获取角色列表
exports.getRoleList = function(req, res) {

    var clientID = req.params.client_id;

    roleManageServic.getRoleList(req, res, clientID)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//添加角色
exports.addRole = function(req, res) {

    var role = {
        role_name: req.body.roleName,
        client_id: req.body.clientId,
        realm_id: req.body.realmId,
        permission_ids: req.body.authorityIds ? req.body.authorityIds.split(",") : []
    };

    roleManageServic.addRole(req, res, role)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};

//修改角色
exports.editRole = function(req, res) {

    var role = {
        role_id: req.body.roleId,
        role_name: req.body.roleName,
        client_id: req.body.clientId,
        permission_ids: req.body.authorityIds ? req.body.authorityIds.split(",") : []
    };

    roleManageServic.editRole(req, res, role)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};

//删除角色
exports.deleteRole = function(req, res) {
    var roleId = req.params.id;
    if (roleId) {
        roleManageServic.deleteRole(req, res, roleId)
            .on("success", function(data) {
                res.status(200).json(data);
            }).on("error", function(codeMessage) {
                res.status(500).json(codeMessage && codeMessage.message);
            }
            );
    }
};

//设置默认角色
exports.setDefaultRole = function(req, res) {     
    let param = {app_id: req.body.app_id,base_role: req.body.base_role}; 
    roleManageServic.setDefaultRole(req, res,param)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );    
};

//查询默认角色
exports.getDefaultRole = function(req, res) {   
    var appId = req.query.app_id;
    roleManageServic.getDefaultRole(req, res,appId)
        .on("success", function(data) {
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

//删除默认角色
exports.delDefaultRole = function(req,res) { 
    var param = {app_id: req.body.app_id};
    roleManageServic.delDefaultRole(req, res,param)
        .on("success", function(data) {            
            res.status(200).json(data);
        }).on("error", function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
        );
};