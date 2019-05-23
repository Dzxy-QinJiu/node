/**
 * Created by wangliping on 2018/3/1.
 */
const salesRoleManageService = require('../service/sales-role-manage-service');
// 获取销售角色列表
exports.getSalesRoleList = function(req, res) {
    salesRoleManageService.getSalesRoleList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 添加销售角色
exports.addSalesRole = function(req, res) {
    salesRoleManageService.addSalesRole(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//设置默认角色
exports.setDefaultRole = function(req, res) {
    salesRoleManageService.setDefaultRole(req, res, req.params.role_id).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 删除销售角色
exports.deleteSalesRole = function(req, res) {
    salesRoleManageService.deleteSalesRole(req, res, req.params.role_id).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//清空销售角色
exports.resetSalesRole = function(req, res) {
    salesRoleManageService.resetSalesRole(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//修改销售的角色
exports.changeSalesRole = function(req, res) {
    salesRoleManageService.changeSalesRole(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//根据销售id获取其角色
exports.getSalesRoleByMemberId = function(req, res) {
    salesRoleManageService.getSalesRoleByMemberId(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//设置某个角色的客户容量
exports.setSalesRoleGoal = function(req, res) {
    salesRoleManageService.setSalesRoleGoal(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};