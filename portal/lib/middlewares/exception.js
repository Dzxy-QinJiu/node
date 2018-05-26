/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/8/23.
 */
//处理500错误
var errorLogger = require("../utils/logger").getLogger('error');
let BackendIntl = require("../../lib/utils/backend_intl");

module.exports = function(error, req, res, next) {
    if (error) {
        var status = res.statusCode || 500;
        var backendIntl = new BackendIntl(req.query.lang || undefined);
        var msg = backendIntl.get("service.not.available", '对不起，服务暂时不可用。');
        errorLogger.error(error || msg);
        res.writeHead(status, {'Content-Type': 'text/plain;charset=UTF-8'});
        res.end(msg);
    }
};