/**
 * Created by wangliping on 2018/3/1.
 */
"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);

const salesRoleRestApis = {
    getSalesRoleList: "http://172.19.105.57:8391/rest/base/v1/group/teamroles",
    addSalesRole: "http://172.19.105.57:8391/rest/base/v1/group/teamrole",
    deleteSalesRole: "http://172.19.105.57:8391/rest/base/v1/group/teamrole/:role_id",
    setDefaultRole: "/rest/base/v1/group/teamrole/default/:role_id"
};

//获取销售角色列表
exports.getSalesRoleList = function (req, res) {
    return restUtil.authRest.get({
        url: salesRoleRestApis.getSalesRoleList,
        req: req,
        res: res
    }, null);
};
//添加销售角色
exports.addSalesRole = function (req, res, role) {
    return restUtil.authRest.post({
        url: salesRoleRestApis.addSalesRole,
        req: req,
        res: res
    }, role);
};
//设置默认角色
exports.setDefaultRole = function (req, res, role_id) {
    return restUtil.authRest.put({
        url: salesRoleRestApis.setDefaultRole.replace(":role_id", role_id),
        req: req,
        res: res
    }, null);
};
//删除销售角色
exports.deleteSalesRole = function (req, res, role_id) {
    return restUtil.authRest.del({
        url: salesRoleRestApis.deleteSalesRole.replace(":role_id", role_id),
        req: req,
        res: res
    }, null);
};
