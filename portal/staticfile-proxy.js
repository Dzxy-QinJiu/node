/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/9/12.
 */
var isInited = false;
var config = require("../conf/config");
var request = require('request');
var proxyDir = config.staticFileProxyDir;
module.exports = function (app) {
    if (isInited) {
        return;
    }
    isInited = true;
    app.use('/resources/', function (req, res, next) {
        req.pipe(request(proxyDir+req.originalUrl)).pipe(res);
    });
};

