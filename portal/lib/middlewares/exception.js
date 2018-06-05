/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/8/23.
 */
//处理500错误
let errorLogger = require("../utils/logger").getLogger('error');
let BackendIntl = require("../../lib/utils/backend_intl");

let timeOut = 3000;
module.exports = function (error, req, res, next) {
    if (error) {
        let status = res.statusCode || 500;
        let backendIntl = new BackendIntl(req.query.lang || undefined);
        let msg = backendIntl.get("service.not.available", '对不起，服务暂时不可用。');
        errorLogger.error(error || msg);
        res.writeHead(status, {'Content-Type': 'text/plain;charset=UTF-8'});
        res.end(msg);
        //如果是线上产品，一定时间后退出系统，使openshift重新部署pod
        if (config.isProduction) {
            setTimeout(function () {
                process.exit(1);
            }, timeOut);
        }
    }
};
