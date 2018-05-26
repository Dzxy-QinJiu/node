var getLogger = require("../utils/logger").getLogger;
var morganConfig = require("../../../conf/logger").morgan;
var fs = require("fs");
if (fs.existsSync("../../../../oplate.logger")) {
    morganConfig = require("../../../../oplate.logger").morgan;
}
var morgan = require("morgan");

//初始化访问日志的方法
function accessLogMiddleware() {
    var accessLog = getLogger("access");
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