var config = global.config = require('./conf/config');
var fs = require('fs');
//项目之外有配置文件,这种情况是线上真正部署的情况
if (fs.existsSync('../oplate.config.js')) {
    config = global.config = require('../oplate.config');
}
//正式环境才加node端监控
if (config.isFormal) {
    var oneapm = require('oneapm');
}
//定义全局常量
global.oplateConsts = require('./portal/lib/consts');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var commonUtils = require('./portal/lib/utils/common-utils');
var auth = require('./portal/lib/utils/auth');


//让config模块使用conf/config.js里的配置，而不用去找config/default.js文件
process.env.NODE_CONFIG = JSON.stringify(config);

//让log4js-config模块使用conf/config.js里的配置，而不用去找config/app-logging.json文件
require('log4js-config').init(function() {
    return require('./conf/logger.js');
});

var app = express();
app.set('port', config.port);
// view engine setup
app.set('views', path.join(__dirname, 'portal/modules'));
app.set('view engine', 'ejs');

app.use(compression());

var publicDir = path.join(__dirname, config.isProduction ? './dist' : './portal/public');
if (fs.existsSync(path.join(publicDir, 'favicons/favicon.ico'))) {
    app.use(favicon(path.join(publicDir, 'favicons/favicon.ico')));
}
//dll文件（vendors）
app.use('/dll', express.static(path.resolve(__dirname, './dll')));
if (config.webpackMode !== 'production') {
    require('./portal/staticfile-proxy')(app);
    // require("./portal/lib/middlewares/webpack")(app);
} else {
    app.use('/resources/', express.static(publicDir));
}
app.use('/static/', express.static(path.join(__dirname, './portal/static')));
app.use('/upload/', express.static(path.join(__dirname, 'upload')));
//添加微信小程序认证文件
app.use('/6CMRQ4Aa8c.txt', function(req, res) {
    res.sendFile(path.resolve(__dirname, './portal/static/6CMRQ4Aa8c.txt'));
});
//添加百度小程序认证文件
app.use('/bd_mapp_domaincer_18033410.txt', function(req, res) {
    res.sendFile(path.resolve(__dirname, './portal/static/bd_mapp_domaincer_18033410.txt'));
});

app.use(require('./portal/lib/middlewares/accesslog'));
//handle request entity too large
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser('83DHWG36'));

//引用express-domain-middleware插件
//该插件为每次请求的req和res创建一个单独的domain
//这样在异步请求里发生的错误就能被express的错误处理函数捕获了，而不至于将当前请求挂起
app.use(require('express-domain-middleware'));
//线上环境才添加追踪
if (commonUtils.ip.isProductionEnvironment()) {
    //数据请求追踪
    var dataTrace = require('distributed-trace-for-nodejs');
    dataTrace.init({
        zipkinUrl: config.traceConfig.zipkinUrl,
        serviceName: config.traceConfig.serviceName
    });
    app.all('*', dataTrace.trace);
}
//引入session
var sessionMiddleware = require('./portal/lib/middlewares/session');
app.use(sessionMiddleware);
//为程序添加res.error
app.use(require('./portal/lib/middlewares/resError'));
//异常添加处理
app.use(require('./portal/lib/middlewares/exception'));

//定义全局的portal路径
global.portal_root_path = path.resolve(__dirname, './portal');
//定义全局的modules路径
global.module_root_path = path.resolve(__dirname, './portal/modules');
//定义全局的配置文件路径
global.config_root_path = path.resolve(__dirname, './conf');

//引入rest请求辅助工具
var restLogger = require('./portal/lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
//引入呼叫中心
require('./portal/lib/middlewares/callcenter')(app, restUtil.authRest);

//初始化controller
require('./portal/controller')(app);
//处理404
app.use(require('./portal/lib/middlewares/404'));
//处理uncaughtException
var errorLogger = require('./portal/lib/utils/logger').getLogger('error');
process.on('uncaughtException', function(err) {
    errorLogger.error(err.stack || err.message || 'uncaughtException');
});
//为程序指定一个进程名
process.title = config.processTitle;
// init rest-global-handler
require('./portal/global/rest-global-handler');
//启动应用
var server = app.listen(app.get('port'), function() {
    // eslint-disable-next-line no-console
    console.log('Oplate Server Running At http://localhost:' + app.get('port'));
});
//创建socketIO,启动推送
if (auth.getLang() !== 'es_VE') {
    require('./portal/modules/socketio').startSocketio(server);
}

