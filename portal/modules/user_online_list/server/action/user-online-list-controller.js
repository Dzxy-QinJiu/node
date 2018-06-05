var userOnlineListService = require('../service/user-online-list-service');

//获取用户在线列表
exports.getOnlineUserList = function(req, res) {
    userOnlineListService.getOnlineUserList(req, res)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.json(err.message || '在线用户列表获取失败');
        });
};

//  踢出用户下线
exports.kickUser = function(req, res){
    var ids = JSON.parse(req.body.ids);
    userOnlineListService.kickUser(req, res, ids)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.json(err.message);
        });
};