var DEFAULT_MAX_LOG_SIZE = 2048000,
    DEFAULT_LOG_BACKUP = global.config.logfileCount,
    DEFAULT_LOG_LEVEL = global.config.logLevel;
var commonUtil = require('../portal/lib/utils/common-utils');
var _ = require('lodash');
var moment = require('moment');

var path = require('path'),
    fs = require('fs');
var uuidV4 = require('uuid/v4');
var serverIp = commonUtil.ip.getServerAddresses[0];

var isProduction = config.isProduction, logDir;
logDir = isProduction ?
    path.resolve(__dirname, '../../data/') :
    path.resolve(__dirname, '../data/');
//是否是正式环境
var isFormal = global.config.isFormal;

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
function getLogFilePath(fileName) {
    return path.resolve(logDir, fileName);
}
/*
 配置中logLevel是为logger设置的level，省去了手动调用log.setLevel(level)的麻烦;
 see https://github.com/nomiddlename/log4js-node/wiki/Appenders
 本地日志appenders
 */
var localAppenders = [
    {type: 'console'},
    //access.log是morgan做express访问日志用的
    {
        type: 'file',
        filename: getLogFilePath('access.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'access',
        logLevel: DEFAULT_LOG_LEVEL
    },
    {
        type: 'file',
        filename: getLogFilePath('page.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'page',
        logLevel: DEFAULT_LOG_LEVEL
    },
    //错误日志
    {
        type: 'file',
        filename: getLogFilePath('error.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'error',
        logLevel: DEFAULT_LOG_LEVEL
    },
    //rest请求代理日志
    {
        type: 'file',
        filename: getLogFilePath('rest_time.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'rest',
        logLevel: DEFAULT_LOG_LEVEL
    },
    //认证请求日志
    {
        type: 'file',
        filename: getLogFilePath('auth.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'auth',
        logLevel: DEFAULT_LOG_LEVEL
    },
    //session日志
    {
        type: 'file',
        filename: getLogFilePath('session.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'session',
        logLevel: DEFAULT_LOG_LEVEL
    },
    //测试 请求代理日志
    {
        type: 'file',
        filename: getLogFilePath('rest_test.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'test',
        logLevel: DEFAULT_LOG_LEVEL
    },
    {
        type: 'file',
        filename: getLogFilePath('push.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'push',
        logLevel: DEFAULT_LOG_LEVEL
    },
    {
        type: 'file',
        filename: getLogFilePath('batch.log'),
        maxLogSize: DEFAULT_MAX_LOG_SIZE,
        backups: DEFAULT_LOG_BACKUP,
        category: 'batch',
        logLevel: DEFAULT_LOG_LEVEL
    }
];
//远程日志es appender模板
var esType = {
    type: 'log4js-elasticsearch',
    indexName: function(loggingEvent) {
        let weekOfYear = moment().week(); 
        //es索引名称, 按周进行记录
        return 'curtaoweb' + weekOfYear;
    },
    url: global.config.esUrl,
    logId: function(loggingEvent) {
        return uuidV4();
    },
    buffersize: 1024,
    timeout: 45000,
    layout: {
        type: 'logstash',
        tags: [global.config.loggerTag],
        sourceHost: function(loggingEvent) {
            return serverIp;
        }
    },
    logLevel: DEFAULT_LOG_LEVEL
};
//远程日志appender
var remoteAppenders = _.map(localAppenders, function(item) {
    if (item.type === 'file') {
        var appender = _.extend({}, esType);
        //将不同类型日志生成es的type表
        appender.typeName = appender.category = item.category;
        return appender;
    } else {
        return item;
    }
});

//包括Log4js的配置还有morgan的配置
module.exports = {
    //log4js的配置文件
    'log4js': {
        //如果是产品环境则使用es的appender上传日志到es中,如果不是产品环境，使用本地文件记录日志
        'appenders': (isFormal === 'true' && global.config.esUrl) ? remoteAppenders : localAppenders
    },
    morgan: {
        //这个是morgan的配置记录哪些http访问日志内容
        tokenParams: 'IP::remote-addr method::method url::url status::status responseTime::response-time contentLength::res[content-length] referrer::referrer userAgent::user-agent'
    },
    defaultTypeId: 'rest'
};