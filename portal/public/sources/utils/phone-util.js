/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2019/1/11.
 */

let callcenter = require('callcenter-sdk-client');
let CallcenterClient = callcenter.client;
let CommonDataUtil = require('PUB_DIR/sources/utils/common-data-util');

let callClient;
//初始化
exports.initPhone = function (user) {
    CommonDataUtil.getOrganization().then((org) => {
        callClient = new CallcenterClient(org.realm_id, user.user_name);
        callClient.init().then(() => {
            console.log('可以打电话了!');
        }, (error) => {
            console.error(error || '电话系统初始化失败了!');
        });
    });
};

exports.getCallClient = function () {
    return callClient;
};

exports.unload = function (func) {
    callClient && callClient.onbeforeunload(func);
};