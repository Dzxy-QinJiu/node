var userService = require('../service/user');
//根据角色，获取成员列表
exports.getUserListByRole = function(req, res) {
    userService.getUserListByRole(req, res, req.query).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '根据角色获取成员列表失败');
    });
};
//根据成员id，获取成员信息
exports.getUserById = function(req , res) {
    userService.getUserById(req,res,req.params.user_id).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '获取成员信息失败');
    });
};