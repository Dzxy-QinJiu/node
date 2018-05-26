var errorLogger = require("../utils/logger").getLogger('error');
let BackendIntl = require("../../lib/utils/backend_intl");

module.exports = function(req, res, next) {
    //为res添加 error 方法
    res.error = function(err) {
        var status = err.status || 500;
        var backendIntl = new BackendIntl(req.query.lang || undefined);
        var msg = backendIntl.get("service.not.available", '对不起，服务暂时不可用。');
        errorLogger.error(err.stack || err.message || msg);
        res.writeHead(status, {'Content-Type': 'text/plain;charset=UTF-8'});
        res.end(msg);
    };

    next();
};