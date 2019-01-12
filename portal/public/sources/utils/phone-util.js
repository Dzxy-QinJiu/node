/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2019/1/11.
 */

let callcenter = require('callcenter-sdk-client');
let CallcenterClient = callcenter.client, CallcenterType = callcenter.type;
let CommonDataUtil = require('PUB_DIR/sources/utils/common-data-util');
let callClient;
//初始化
exports.initPhone = function(user) {
    // CommonDataUtil.getUserPhoneNumber().then(callNumberInfo => {
    CommonDataUtil.getOrganization().then((org) => {
        let userName = org.realm_name + '_' + user.user_name;
        callClient = new CallcenterClient(CallcenterType.RONGLIAN, userName);
        callClient.init().then(() => {
            console.log('可以打电话了!');
        }, () => {
            console.log('电话系统初始化失败了!');
        });
    });
    // });
};

exports.getCallClient = function() {
    return callClient;
};

//是否使用电话系统
exports.useCallCenter = function(organization) {
    //eefung，civiw，oshdan，使用原来的电话系统
    return organization !== '36v8tudu9Z' && organization !== '36duh3ok3i' && organization !== '36553nnfjC';
};
