/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/4/15.
 */
var config = global.config;
var Coordinator = require("coordinator-node-client");
//  初始化 Coordinator客户端
module.exports = function initCoordinator(callback) {
    //  初始化
    var client = new Coordinator(config.coordinatorConfig);
    // 启动前需要设置token，
    client.setToken("123");
    client.logger.level('info');
    client.start(function(error) {
        //error存在的时候启动失败，不存在的时候启动成功
        // eslint-disable-next-line no-console
        console.log(error || 'Coordinator启动成功!');
        //启动推送
        if (callback instanceof Function) {
            callback.call();
        }
    });
    config.coordinator = client;
};