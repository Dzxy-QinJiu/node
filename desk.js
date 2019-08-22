/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/8/17.
 */
var config = global.config = require('./conf/config');
var fs = require("fs");
//项目之外有配置文件,这种情况是线上真正部署的情况
if (fs.existsSync("../oplate.config.js")) {
    config = global.config = require('../oplate.config');
}
//定义全局常量
global.oplateConsts = require("./portal/lib/consts");
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require("compression");
var commonUtils = require("./portal/lib/utils/common-utils");

//修改配置数据
config.isProduction=true;
config.webpackMode="production";
process.argv=process.argv+" -m";
config.gateway="https://gtoplate.antfact.com";

//让config模块使用conf/config.js里的配置，而不用去找config/default.js文件
process.env.NODE_CONFIG = JSON.stringify(config);

//让log4js-config模块使用conf/config.js里的配置，而不用去找config/app-logging.json文件
require("log4js-config").init(function () {
    return require("./conf/logger.js");
});

function initExpress() {
    var expressApp = express();

    expressApp.set('port', config.port);
// view engine setup
    expressApp.set('views', path.join(__dirname, 'portal/modules'));
    expressApp.set('view engine', 'ejs');

    expressApp.use(compression());

    var publicDir = path.join(__dirname, config.isProduction ? './dist' : './portal/public');
    if (fs.existsSync(path.join(publicDir, "favicons/favicon.ico"))) {
        expressApp.use(favicon(path.join(publicDir, 'favicons/favicon.ico')));
    }
//dll文件（vendors）
    expressApp.use('/dll', express.static(path.resolve(__dirname, './dll')));
    if (config.webpackMode !== 'production') {
        require("./portal/staticfile-proxy")(expressApp);
        // require("./portal/lib/middlewares/webpack")(app);
    } else {
        expressApp.use('/resources/', express.static(publicDir));
    }
    expressApp.use('/static/', express.static(path.join(__dirname, './portal/static')));
    expressApp.use('/upload/', express.static(path.join(__dirname, 'upload')));

    expressApp.use(require("./portal/lib/middlewares/accesslog"));
//handle request entity too large
    expressApp.use(bodyParser.json({limit: '50mb'}));
    expressApp.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    expressApp.use(cookieParser("83DHWG36"));


//引用express-domain-middleware插件
//该插件为每次请求的req和res创建一个单独的domain
//这样在异步请求里发生的错误就能被express的错误处理函数捕获了，而不至于将当前请求挂起
    expressApp.use(require('express-domain-middleware'));
//线上环境才添加追踪
    if (commonUtils.ip.isProductionEnvironment()) {
        expressApp.all("*", config.oplateTrace.trace);
    }
//引入session
    var sessionMiddleware = require("./portal/lib/middlewares/session");
    expressApp.use(sessionMiddleware);
//为程序添加res.error
    expressApp.use(require("./portal/lib/middlewares/resError"));

//定义全局的portal路径
    global.portal_root_path = path.resolve(__dirname, "./portal");
//定义全局的modules路径
    global.module_root_path = path.resolve(__dirname, "./portal/modules");
//定义全局的配置文件路径
    global.config_root_path = path.resolve(__dirname, "./conf");

//初始化controller
    require("./portal/controller")(expressApp);
//处理404
    expressApp.use(require("./portal/lib/middlewares/404"));
    //处理uncaughtException
    var errorLogger = require("./portal/lib/utils/logger").getLogger("error");
    process.on('uncaughtException', function (err) {
        errorLogger.error(err.stack || err.message || 'uncaughtException');
    });
//为程序指定一个进程名
    process.title = config.processTitle;
// init rest-global-handler
    require('./portal/global/rest-global-handler');
//启动应用
    var server = expressApp.listen(expressApp.get('port'), function () {
        console.log('Oplate Server Running At http://localhost:' + expressApp.get('port'));
    });

    //创建socketIO,启动推送
    require("./portal/modules/socketio").startSocketio(server);
}

const electron = require('electron');

const {app, BrowserWindow, Menu, ipcMain, ipcRenderer} = electron;

var mainWnd = null;

function createMainWnd() {
    initExpress();
    mainWnd = new BrowserWindow({
        width: 1600,
        height: 900,
        icon: './electron/oplate.ico'
    });
    mainWnd.loadURL('http://localhost:9191/');
    mainWnd.focus();

    // 打开窗口的调试工具
    mainWnd.on('closed', () => {
        mainWnd = null;
    });
}

app.on('ready', createMainWnd);

app.on('window-all-closed', () => {
    app.quit();
});

