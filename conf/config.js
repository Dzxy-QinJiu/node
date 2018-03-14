/**
 *
 */
//是否是线上环境  isProduction=true表示是线上环境
var webpackMode = "dev", isProduction = false;
//是否正式环境
var isFormal = "true" ||  process.env.FORMALENV || "false";

//node环境设置
if (process.argv.indexOf("p") >= 0
    ||
    process.argv.indexOf("-p") >= 0
    ||
    process.argv.indexOf("--p") >= 0
) {
    isProduction = true;
}
//webpack环境设置
if (process.argv.indexOf("d") >= 0
    || process.argv.indexOf("-d") >= 0
    || process.argv.indexOf("--d") >= 0
) {
    webpackMode = "dev";
} else {
    webpackMode = "production";
}


//分布式跟踪
var trace = require("distributed-trace-for-nodejs");
trace.init({
    zipkinUrl: process.env.ZIPKINURL || "http://172.19.103.39:9002",   //将跟踪记录到服务器的url
    serviceName: "oplate_web"
});
//获取hazelcast的地址
function getHazelcastAddress() {
    // 一开始用的鹰眼的caster地址和端口：172.19.105.138 : 5712
    // 后oplate和ketao的caster地址和端口修改为：（用来给：蚁坊识微官网、公共应用（告警、sso等））
    //  ["172.19.141.4,172.19.141.5,172.19.141.6"] : ["5762,5762,5762"]
    if (process.env.CASTER_IP && process.env.CASTER_PORT) {
        var ipArray = process.env.CASTER_IP.split(","), portArray = process.env.CASTER_PORT.split(",");
        return ipArray.map((ip, idx) => {
            return {host: ip, port: portArray[idx]};
        });
    }
    //默认为测试环境
    return [{host: "172.19.106.110", port: "5766"}];
}
//获取hazelcast的认证信息
function getHazelcastGroupConfig() {
    //一开始用的鹰眼的caster用户名和密码都是：caster-eageye-session
    //后oplate和ketao的caster的用户名和密码改为：caster-eefung
    if (process.env.CASTER_USERNAME && process.env.CASTER_PASSWORD) {
        return {"name": process.env.CASTER_USERNAME, "password": process.env.CASTER_PASSWORD};
    }

    //默认为测试环境
    return {"name": "oplate-test-session", "password": "oplate-test-session"};
}
//获取是否需要nock数据
function getProvideNockData() {
    var needNockData = false;
    if (process.argv.indexOf("nock") >= 0
        ||
        process.argv.indexOf("-nock") >= 0
        ||
        process.argv.indexOf("--nock") >= 0) {
        needNockData = true;
    }
    return needNockData;
}

//获取网关地址
function getGateway() {
    var gatewayHost = process.env.OPLATE_GATEWAY_SERVICE_HOST;
    var gatewayPort = process.env.OPLATE_GATEWAY_SERVICE_PORT;
    var gateway = process.env.GATEWAY;

    //如果网关未配置
    if (!gateway) {
        //配置了主机和端口
        if (gatewayHost && gatewayPort) {
            gateway = "http://" + gatewayHost + ":" + gatewayPort
        }
    }
    return gateway;
}
//获取协调服务地址
var coordinateAddress = {};
coordinateAddress.domain = process.env.COORDINATOR_DOMAIN;
coordinateAddress.host = process.env.COORDINATOR_SERVER_SERVICE_HOST;
coordinateAddress.port = process.env.COORDINATOR_SERVER_SERVICE_PORT;

var config = {
    "system": {
        "elapseLogMinTime": 0,

        "caster": {
            properties: {
                'hazelcast.client.heartbeat.interval': 5000,
                'hazelcast.client.heartbeat.timeout': 60000
            },
            groupConfig: getHazelcastGroupConfig(),
            networkConfig: {
                "addresses": getHazelcastAddress(),
                "connectionAttemptLimit": Infinity,
                "connectionAttemptPeriod": 1000 * 10,
                "connectionTimeout": 5000,
                "redoOperation": true,
                "smartRouting": true,
                "socketOptions": {}
            },
            serializationConfig: {}
        },
    },
    //devserver的静态文件路径
    staticFileProxyDir: process.env.STATIC_FILE_PROXY_DIR || 'http://localhost:8081',
    //日志文件个个数
    logfileCount: process.env.LOGFILE_COUNT || 100,
    //日志的级别
    logLevel: process.env.LOG_LEVEL || "DEBUG",
    //是否是正式环境
    formal: isFormal,
    // es地址
    esUrl: process.env.ES,//http://192.168.2.21:9200,
    //进程名
    processTitle: process.env.PROCESS_TITLE || "ketao",
    //web服务端口
    port: process.env.OPLATE_PORT || 9191,
    //是否是线上环境
    isProduction: isProduction,
    //是否提供nock数据
    provideNockData: getProvideNockData(),
    //webpack打包模式
    webpackMode: webpackMode,
    //session配置
    session: {
        casterMapName: process.env.CASTER_MAP_NAME || "oplate_session",//hazelcast中的map名
        maxAge: process.env.SESSIONTTL || 60 * 60 * 1000, //session默认一小时
        secret: "CV193WIC"   //加密session id使用的秘钥
    },
    proxy: {
        "protocal": "http://",
        "host": "172.19.104.108",
        "port": "8182"
    },
    //rest返回数据格式为json
    restJson: true,
    //默认rest请求超时时长
    restTimeout: 1000 * 30,
    //跟踪实例
    oplateTrace: trace,
    //没有配置推送服务地址，并且从协调服务中根据id获取不到可用的服务地址时用的默认的推送服务地址
    pushServer: "http://172.19.104.103:9093",//测试环境：http://172.19.104.108:9093
    coordinatorConfig: {
        // coordinator 服务地址连接
        coordinator: {
            // 设置域名或者host和port
            domain: coordinateAddress.domain || "",
            host: coordinateAddress.host || "172.19.103.22",//测试环境：172.19.103.39
            port: coordinateAddress.port || 8080
        },
        registerSelf: false,//是否注册本服务(nodejs)到服务注册中心
        token: "123"
    },
    appId: "COM.ANTFACT.OPLATE.NOTIFY",//从协调服务中获取推送服务地址时所需的id
    loginParams: {
        realm: process.env.LOGIN_REALM || "3722pgujaa",//安全域Id
        clientId: process.env.LOGIN_CLIENT_ID || "3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9",//应用Id
        clientSecret: process.env.LOGIN_CLIENT_SECRET || "477qpz3uC5fZcaz0w1YloKWA",//应用密钥
        grantType: process.env.LOGIN_GRANT_TYPE || "client_credentials"//授权类型
    },
    gateway: getGateway() || 'http://gateway-ketao.antfact.com',//服务网关,测试环境：http://172.19.103.57:9090,公网'https://gtoplate.antfact.com',
    metricAddress: process.env.METRIC_ADDRESS,//"http://172.19.104.253:8086/oplate_web",
    loggerTag: process.env.LOGGER_TAG || "oplate-web",//日志标签,用来区分是oplate的还是ketao的
    siteID: process.env.SITE_ID || '1',//piwik需配置site_id,1:oplate,4:ketao
    pushServerAddress: process.env.PUSH_SERVER_ADDRESS || "http://notify-ketao.antfact.com:80",//推送的服务地址（客套需要配置:http://notify-ketao.antfact.com:80）
    lang: process.env.OPLATE_LANG, //语言环境(优先)
    useSso: process.env.USESSO//是否使用sso
};

config.nockUrl = config.proxy.protocal + config.proxy.host + ":" + config.proxy.port;

module.exports = config;
