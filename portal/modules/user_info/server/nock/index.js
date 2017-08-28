/**
 * Created by 肖金峰 on 2016/01/29.
 */
var Log = require("../dto/log");
var uuid = require(require("path").join(portal_root_path, "lib/utils/uuid"));
var nock = require('nock');
var nockParser = require(require('path').join(portal_root_path, './lib/utils/nockParser'));
var userInfoManageServic = require("../service/user-info-manage-service");
var oldPwd = "88881234";

var userInfo = {
    id: uuid(),
    userName: "肖金峰",
    passwd: "",
    newPasswd: "",
    rePasswd: "",
    phone: "13843819438",
    email: "13843819438@qq.com",
    roleName: "oplateOwner"
};
var logList = [
    new Log({
        id: uuid(),
        loginTime: "2013.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2023.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2033.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2043.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    }),
    new Log({
        id: uuid(),
        loginTime: "2053.12.1 18:09:12",
        loginAddress: "山东 济南",
        loginIP: "102.3.1.2",
        loginBrowser: "火狐",
        loginEquipment: "电脑（win10）"
    })
];
exports.init = function () {

    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/oplate\/v1\/user\/id\/.*/)
        .query(true)
        .reply(function () {
            return [200, userInfo];
        });

    nock(config.nockUrl)
        .persist()
        .get(userInfoManageServic.urls.getLogList)
        .query(true)
        .reply(function () {
            return [200, logList];
        });


    nock(config.nockUrl)
        .persist()
        .put(userInfoManageServic.urls.editUserInfo)
        .query(true)
        .reply(function (url, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();

            var id = req.body.id;
            var phone = req.body.phone;
            var email = req.body.email;
            var roleName = req.body.roleName;
            var userName = req.body.userName;
            var target = userInfo;

            if (target) {
                target.userName = userName;
                target.passwd = "";
                target.phone = phone;
                target.email = email;
                target.roleName = roleName;
                target.rePasswd = "";
                target.newPasswd = "";

            }

            return [200, target];

        });

    nock(config.nockUrl)
        .persist()
        .put(userInfoManageServic.urls.editUserInfoPwd)
        .query(true)
        .reply(function (url, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();

            var id = req.body.id;
            var userName = req.body.userName;
            var phone = req.body.phone;
            var email = req.body.email;
            var newPasswd = req.body.newPasswd;
            var roleName = req.body.roleName;
            oldPwd = newPasswd;

            var target = userInfo;

            if (target) {
                target.userName = userName;
                target.passwd = "";
                target.phone = phone;
                target.email = email;
                target.roleName = roleName;
                target.newPasswd = "";
                target.rePasswd = "";
            }
            return [200, target];
        });

    nock(config.nockUrl)
        .persist()
        .get(userInfoManageServic.urls.checkUserInfoPwd)
        .query(true)
        .reply(function (url, requestBody) {
            var req = new nockParser().setRequest(this.req).setBody(requestBody).parse();

            var passwd = req.query.passwd;
            var flag = false;

            if (oldPwd) {
                if (oldPwd == passwd) {
                    flag = true;
                }
            }
            return [200, {flag: flag}];
        });
};
