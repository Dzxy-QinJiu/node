/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by 肖金峰 on 2016/2/3.
 */

"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var _ = require("underscore");
var roleRestApis = {
    getRoleList: "/rest/base/v1/application/roles",
    addRole: "/rest/base/v1/role",
    editRole: "/rest/base/v1/role",
    deleteRole: "/rest/base/v1/role",
    setDefaultRole:"/rest/base/v1/application/baserole/config",
    getDefaultRole:"/rest/base/v1/application/baserole/config",
    delDefaultRole:"/rest/base/v1/application/baserole/config"
};
exports.urls = roleRestApis;

// 获取角色列表
exports.getRoleList = function(req, res, clientID) {
    return restUtil.authRest.get(
        {
            url: roleRestApis.getRoleList + "/" + clientID,
            req: req,
            res: res
        }, null, {
            success: function(eventEmitter, data) {
                //处理数据
                if (_.isObject(data)) {
                    //权限组数据格式的修改
                    if (data.permissions) {
                        for (var key in data.permissions) {
                            data.permissions[key] = data.permissions[key].map(function(permission) {
                                return {
                                    permissionId: permission.permission_id,
                                    permissionName: permission.permission_name,
                                    permissionDefine: permission.permission_define,
                                    permissionApis: permission.permission_apis
                                };
                            });
                        }
                    }
                    //角色列表数据格式的修改
                    if (_.isArray(data.roles) && data.roles.length > 0) {
                        data.roles = data.roles.map(function(role) {
                            return {
                                roleId: role.role_id,
                                roleName: role.role_name,
                                permissionIds: role.permission_ids
                            };
                        });
                    }
                }
                eventEmitter.emit("success", data);
            }
        });
};

// 添加角色
exports.addRole = function(req, res, role) {
    return restUtil.authRest.post(
        {
            url: roleRestApis.addRole,
            req: req,
            res: res
        },
        role);
};

// 编辑角色
exports.editRole = function(req, res, role) {
    return restUtil.authRest.put(
        {
            url: roleRestApis.editRole,
            req: req,
            res: res
        },
        role);
};

// 删除角色
exports.deleteRole = function(req, res, roleID) {
    return restUtil.authRest.del(
        {
            url: roleRestApis.deleteRole + "/" + roleID,
            req: req,
            res: res
        },
        null);
};

// 设置默认角色
exports.setDefaultRole = function(req, res,param) {
    return restUtil.authRest.post(
        {
            url: roleRestApis.setDefaultRole,
            req: req,
            res: res
        },param);
};

// 获取默认角色
exports.getDefaultRole = function(req, res,appId) {    
    return restUtil.authRest.get(
        {
            url: roleRestApis.getDefaultRole,
            req: req,
            res: res
        },{app_id:appId});
};

// 删除默认角色
exports.delDefaultRole = function(req, res, param) {
    return restUtil.authRest.del(
        {
            url: roleRestApis.delDefaultRole,
            req: req,
            res: res
        },
        param);
};


