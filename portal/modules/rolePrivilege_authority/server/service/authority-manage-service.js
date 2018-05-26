"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var _ = require("underscore");
var authorityRestApis = {
    getAuthorityList: "/rest/base/v1/application/permissions",
    editAuthorityGroupName: "/rest/base/v1/permission",
    editAuthority: "/rest/base/v1/permission",
    addAuthority: "/rest/base/v1/permission",
    deleteAuthority: "/rest/base/v1/permission"
};
//删除超时时长
var deleteTimeOut = 3 * 60 * 1000;

exports.urls = authorityRestApis;

// 获取权限列表
exports.getAuthorityList = function(req, res, clientID) {
    return restUtil.authRest.get(
        {
            url: authorityRestApis.getAuthorityList + "/" + clientID,
            req: req,
            res: res
        }, null, {
            success: function(eventEmitter, data) {
                //处理数据
                if (_.isObject(data)) {
                    //权限组数据格式的修改
                    for (var key in data) {
                        data[key] = data[key].map(function(permission) {
                            return {
                                permissionId: permission.permission_id,
                                permissionName: permission.permission_name,
                                permissionDefine: permission.permission_define,
                                permissionApis: permission.permission_apis,
                                permissionType: permission.fact_class,
                                permissionDatas: permission.permission_datas || []
                            };
                        });
                    }
                }
                eventEmitter.emit("success", data);
            }
        });
};

// 获取权限组名称
exports.editAuthorityGroupName = function(req, res, authorityGroup) {
    return restUtil.authRest.put(
        {
            url: authorityRestApis.editAuthorityGroupName + "/" + authorityGroup.classifyName,
            req: req,
            res: res
        },
        authorityGroup.authorityIDs);
};

// 编辑权限
exports.editAuthority = function(req, res, authority) {
    return restUtil.authRest.put(
        {
            url: authorityRestApis.editAuthority,
            req: req,
            res: res
        },
        authority, {
            success: function(eventEmitter, data) {
                //处理数据
                if (_.isObject(data)) {
                    //修改后权限数据格式的修改
                    data = {
                        permissionId: data.permission_id,
                        permissionName: data.permission_name,
                        permissionDefine: data.permission_define,
                        permissionApis: data.permission_apis,
                        permissionType: data.fact_class,
                        permissionDatas: data.permission_datas || []
                    };
                }
                eventEmitter.emit("success", data);
            }
        });
};

// 添加权限
exports.addAuthority = function(req, res, authoritys) {
    return restUtil.authRest.post(
        {
            url: authorityRestApis.addAuthority,
            req: req,
            res: res
        },
        authoritys, {
            success: function(eventEmitter, data) {
                //处理数据
                if (_.isArray(data)) {
                    //修改后权限数据格式的修改
                    data = data.map(function(authority) {
                        return {
                            classifyName: authority.classify_name,
                            clientId: authority.client_id,
                            permissionId: authority.permission_id,
                            permissionApis: authority.permission_apis,
                            permissionName: authority.permission_name,
                            permissionDefine: authority.permission_define,
                            permissionType: authority.fact_class,
                            permissionDatas: authority.permission_datas || [],
                            realmId: authority.realm_id
                        };
                    });
                }
                eventEmitter.emit("success", data);
            }
        }
    );
};

// 删除权限
exports.deleteAuthority = function(req, res, authorityIds) {
    return restUtil.authRest.del(
        {
            url: authorityRestApis.deleteAuthority + "/" + authorityIds,
            req: req,
            res: res,
            timeout: deleteTimeOut
        }, null);
};

