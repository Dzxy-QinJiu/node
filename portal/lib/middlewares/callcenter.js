/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2019/1/15.
 */
let callcenter = require('callcenter-sdk-server');

module.exports = function (app, authRest) {
    callcenter.server(app, authRest, {
        routes: [
            {
                method: 'get',
                path: '/rest/config/phone',//前端路径
                serviceMethod: '',
                serviceUrl: '',//电话配置信息的地址
            },
            {
                method: 'post',
                path: '/rest/call/out',//前端路径
                serviceMethod: 'post',
                serviceUrl: '/rest/customer/v2/phone/call/ou',//呼出电话接口地址
            }
        ]
    });
};