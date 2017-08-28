var path = require("path")
var nock = require("nock");
var nockParser = require(path.resolve(portal_root_path, "./lib/utils/nockParser"));
var serviceUrls = require("../service/notification.service").urls;

exports.init = function () {
    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/base\/v1\/message\/notice\/all\/[a-z0-9]+\/[a-z0-9]+/).query(true).reply(function (uri, requestBody) {
        return {};
    });
    nock(config.nockUrl)
        .persist()
        .get("/rest/base/v1/message/notice/false/size").query(true).reply(function (uri, requestBody) {
        return {msg: "查询完成", code: 0, apply: 0, user: 0, customer: 0};
    });
}

