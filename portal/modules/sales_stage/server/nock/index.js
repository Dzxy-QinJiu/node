/**
 * Created by 肖金峰 on 2016/01/29.
 */
var SalesStage = require("../dto/sales-stage");
var nock = require('nock');
var uuid = require(require("path").join(portal_root_path, "lib/utils/uuid"));
var nockParser = require(require('path').join(portal_root_path, './lib/utils/nockParser'));
var SalesStageManageServic = require("../service/sales-stage-manage-service");

var SalesStageList = {
    result: [
        new SalesStage({
            id: "1",
            name: "test1",
            index: "1",
            description: "修改用户的相关描述"
        }),
        new SalesStage({
            id: "2",
            name: "test2",
            index: "2",
            description: "修改用户的相关描述"
        }),
        new SalesStage({
            id: "3",
            name: "test3",
            index: "3",
            description: "修改用户的相关描述"
        }),
        new SalesStage({
            id: "4",
            name: "test4",
            index: "4",
            description: "修改用户的相关描述"
        }),
        new SalesStage({
            id: "5",
            name: "test5",
            index: "5",
            description: "修改用户的相关描述"
        }),
        new SalesStage({
            id: "6",
            name: "test6",
            index: "6",
            description: "修改用户的相关描述"
        })
    ]

};


exports.init = function () {

    nock("http://172.19.104.108:8182")
        .persist()
        .get(SalesStageManageServic.urls.getSalesStageList)
        .query(true)
        .reply(function () {
            return [200, SalesStageList]
        });
};
