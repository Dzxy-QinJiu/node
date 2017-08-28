/**
 * Created by wangliping on 2016/2/2.
 * 测试安全域管理的nock文件
 */

var nock = require('nock');
var nockParser = require(require('path').join(portal_root_path, './lib/utils/nockParser'));
var restUrl = require("../service/realm-manage-service").urls;

var realmData = require("./data");

exports.init = function () {
    //获取安全域列表
    nock(config.nockUrl)
        .persist()
        .get(restUrl.getRealms).query(true).reply(200, function (uri, requestBody) {
        var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
        var curRealmObj = realmData.getRealms(req.query);
        return curRealmObj;
    });

    //添加安全域
    nock(config.nockUrl)
        .persist()
        .post(restUrl.addRealm).query(true).reply(function (uri, requestBody) {
        var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
        var newRealm = realmData.addRealm(req.body);
        return newRealm;
    });

    //修改安全域
    nock(config.nockUrl)
        .persist()
        .put(restUrl.modifyRealm).reply(function (uri, requestBody) {
        var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();
        var editRealm = realmData.editRealm(req.body);
        return editRealm;
    });

};
