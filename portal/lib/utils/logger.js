var log4js = require('log4js')
    , loggerConfig = require('../../../conf/logger')
    , _ = require('lodash');

log4js.configure(loggerConfig.log4js);
//获取logger的方法
function getLogger(logId) {
    //是否包含logId指的appender类型
    var config = _.find(loggerConfig.log4js.appenders, function(item) {
        return item.category === logId;
    });
    //如果没有使用默认的appender
    if (!config) {
        logId = loggerConfig.defaultTypeId;
    }
    var logger = log4js.getLogger(logId);
    //如果没有对应的logger，使用oplateWeb的logger
    if (logger !== null) {
        var logConfig = _.find(loggerConfig.log4js.appenders, function(item) {
            return item.category === logId;
        });
        if (logConfig !== null) {
            logger.setLevel(logConfig.logLevel);
        } else {
            throw 'no logger with logId : ' + logId + ' found';
        }
        return logger;
    } else {
        throw 'no logger with logId : ' + logId + ' found';
    }
}
exports.getLogger = getLogger;
