var getLogger = require('../utils/logger').getLogger;
var morganConfig = require('../../../conf/logger').morgan;
var fs = require('fs');
if (fs.existsSync('../../../../oplate.logger')) {
    morganConfig = require('../../../../oplate.logger').morgan;
}
var CommonUtil = require('../utils/common-utils');
var morgan = require('morgan');

//初始化访问日志的方法
function accessLogMiddleware() {
    var accessLog = getLogger('access');
    // 重写morgan获取ip的方法
    morgan.token('remote-addr', CommonUtil.ip.getClientIp);
    //配置morgan
    var morganMiddleware = morgan(morganConfig.tokenParams, {
        stream: {
            write: function(str) {
                accessLog.info(str);
            }
        }
    });
    return morganMiddleware;
}

module.exports = accessLogMiddleware();