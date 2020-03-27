/**
 * Created by wangliping on 2018/3/1.
 */
const officeManageService = require('../service/office-manage-service');
// 获取销售角色列表
exports.getSalesRoleList = function(req, res) {
    officeManageService.getSalesRoleList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 添加销售角色
exports.addSalesRole = function(req, res) {
    officeManageService.addSalesRole(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//设置默认角色
exports.setDefaultRole = function(req, res) {
    officeManageService.setDefaultRole(req, res, req.params.role_id).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 删除销售角色
exports.deleteSalesRole = function(req, res) {
    officeManageService.deleteSalesRole(req, res, req.params.role_id).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//清空销售角色
exports.resetSalesRole = function(req, res) {
    officeManageService.resetSalesRole(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//修改销售的角色
exports.changeSalesRole = function(req, res) {
    officeManageService.changeSalesRole(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//根据销售id获取其角色
exports.getSalesRoleByMemberId = function(req, res) {
    officeManageService.getSalesRoleByMemberId(req, res, req.query).on('success', function(data) {
        //没有查询结果时，默认返回一个空对象，以防止在页面端通过promise调用时被认为是出错，不能正常获取到返回结果
        if (!data) data = {};

        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//设置某个角色的客户容量
exports.setSalesRoleGoal = function(req, res) {
    officeManageService.setSalesRoleGoal(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 编辑某个角色的名称/容量
exports.editPosition = (req, res) => {
    officeManageService.editPosition(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
