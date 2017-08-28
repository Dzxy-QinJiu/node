/**
 * Created by wangliping on 2016/2/2.
 * 测试安全域管理的nock文件
 */

var nock = require('nock');
var nockParser = require(require('path').join(portal_root_path, './lib/utils/nockParser'));
var restUrl = require("../service/app-manage-service").urls;

var appData = require("./data");

exports.init = function () {
    //获取应用列表
    nock(config.nockUrl)
        .persist()
        .get(restUrl.getApps).query(true).reply(200, function (uri, requestBody,cb) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
            var curAppObj = appData.getApps(req.query);
            setTimeout(function() {
                cb(null, [
                    200, curAppObj , {}
                ]);
            } , 500);
        });

    //添加应用
    nock(config.nockUrl)
        .persist()
        .post(restUrl.addApp).query(true).reply(function (uri, requestBody) {
        var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
        var newApp = appData.addApp(req.body);
        return newApp;
    });

    //修改应用
    nock(config.nockUrl)
        .persist()
        .put(restUrl.modifyApp).reply(function (uri, requestBody) {
        var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
        var editApp = appData.editApp(req.body);
        return editApp;
    });

};
