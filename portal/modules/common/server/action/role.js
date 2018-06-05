var roleService = require('../service/role');
//获取角色列表
exports.getRolesByAppId = function(req , res) {
    var app_id = req.params.app_id;
    var with_permission_ids = req.query.permission_ids === 'true';
    roleService.getRolesByAppId(req,res,app_id,with_permission_ids).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '获取角色列表失败');
    });
};
//获取权限列表
exports.getPrivilegeGroupsByAppId = function(req , res) {
    var app_id = req.params.app_id;
    roleService.getPrivilegeGroupsByAppId(req,res,app_id).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '获取权限列表失败');
    });
};