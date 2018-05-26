/**
 * Created by wangliping on 2016/2/2.
 * 测试安全域管理的nock文件
 */

var nock = require('nock');
var nockParser = require(require('path').join(portal_root_path, './lib/utils/nockParser'));
var restUrl = require("../service/user-manage-service").urls;
var userData = require("./data");
function init() {
    //获取用户列表
    nock(config.nockUrl)
        .persist()
        .get(restUrl.getUsers).query(true).reply(200, function(uri, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
            var curUserObj = userData.getUsers(req.query);
            return curUserObj;

        });

    //添加用户
    nock(config.nockUrl)
        .persist()
        .post(restUrl.addUser).query(true).reply(function(uri, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
            var newUser = userData.addUser(req.body);
            return newUser;
        });

    //修改用户
    nock(config.nockUrl)
        .persist()
        .put(restUrl.modifyUser).reply(function(uri, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
            var editUser = userData.editUser(req.body);
            return editUser;
        });

    //删除用户
    nock(config.nockUrl)
        .persist()
        .delete(/\/rest\/oplate\/v1\/user\/.*/).query(true).reply(function(uri, requestBody) {
            var req = new nockParser().setUrlParam('/rest/oplate/v1/user/:userId').setRequest(this.req).setBody(requestBody).parse();
            userData.deleteUser(req.param.userId);
            return true;
        });

    //获取用户日志
    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/oplate\/v1\/userLog\/.*/).query(true).reply(function(uri, requestBody) {
            var req = new nockParser().setUrlParam('/rest/oplate/v1/userLog/:userId').setRequest(this.req).setBody(requestBody).parse();
            var userId = req.param.userId;
            var logList = userData.getUserLog();
            return logList;
        });

    //获取角色列表
    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/oplate\/v1\/application\/roles\/.*/).query(true).reply(function(uri, requestBody) {
            var req = new nockParser().setUrlParam('/rest/oplate/v1/application/role/:clientId').setRequest(this.req).setBody(requestBody).parse();
            var clientId = req.param.clientId;
            var rolesObj = userData.getRoles();
            return rolesObj;
        });
}
exports.init = init;