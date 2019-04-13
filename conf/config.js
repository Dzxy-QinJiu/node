/**
 * 配置信息
 * oplate 安全域ID、应用ID、应用密钥（正式、测试环境的配置相同）
     LOGIN_REALM：3722pgujaa
     LOGIN_CLIENT_ID：3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9
     LOGIN_CLIENT_SECRET：477qpz3uC5fZcaz0w1YloKWA
 * caster、网关（区分正式和测试环境）
 * 正式环境的配置
     CASTER_IP："172.19.141.4,172.19.141.5,172.19.141.6"
     CASTER_PORT："5762,5762,5762"
     CASTER_USERNAME：caster-eefung
     CASTER_PASSWORD：caster-eefung
     GATEWAY：http://gateway-ketao.antfact.com
     PUSH_SERVER_ADDRESS：http://notify-ketao.antfact.com:80
 * 测试环境的配置
     CASTER_IP：172.19.106.110
     CASTER_PORT：5766
     CASTER_USERNAME：oplate-test-session
     CASTER_PASSWORD：plate-test-session
     GATEWAY：http://172.19.103.57:9090
     PUSH_SERVER_ADDRESS：http://172.19.103.211:9093
 * zipkin、调用链跟踪记录（只有线上的正式环境有的配置）
     ZIPKINURL：http://172.19.103.39:9002
     METRIC_ADDRESS：http://172.19.103.123:8086/oplate_web
 *
 *
 */
var path = require('path');
//是否是线上环境  isProduction=true表示是线上环境
var webpackMode = 'dev', isProduction = false;
//是否正式环境
var isFormal = process.env.FORMALENV || 'false';

//node环境设置
if (process.argv.indexOf('p') >= 0
    ||
    process.argv.indexOf('-p') >= 0
    ||
    process.argv.indexOf('--p') >= 0
) {
    isProduction = true;
}
//webpack环境设置
if (process.argv.indexOf('d') >= 0
    || process.argv.indexOf('-d') >= 0
    || process.argv.indexOf('--d') >= 0
) {
    webpackMode = 'dev';
} else {
    webpackMode = 'production';
}

//获取hazelcast的地址
function getHazelcastAddress() {
    // 一开始用的鹰眼的caster地址和端口：172.19.105.138 : 5712
    // 后oplate和ketao的caster地址和端口修改为：（用来给：蚁坊识微官网、公共应用（告警、sso等））
    //  ["172.19.141.4,172.19.141.5,172.19.141.6"] : ["5762,5762,5762"]
    if (process.env.CASTER_IP && process.env.CASTER_PORT) {
        var ipArray = process.env.CASTER_IP.split(','), portArray = process.env.CASTER_PORT.split(',');
        return ipArray.map((ip, idx) => {
            return {host: ip, port: portArray[idx]};
        });
    }
    //默认为测试环境
    return [{host: '172.19.106.110', port: '5766'}];
}
//获取hazelcast的认证信息
function getHazelcastGroupConfig() {
    //一开始用的鹰眼的caster用户名和密码都是：caster-eageye-session
    //后oplate和ketao的caster的用户名和密码改为：caster-eefung
    if (process.env.CASTER_USERNAME && process.env.CASTER_PASSWORD) {
        return {'name': process.env.CASTER_USERNAME, 'password': process.env.CASTER_PASSWORD};
    }

    //默认为测试环境
    return {'name': 'oplate-test-session', 'password': 'oplate-test-session'};
}
//获取是否需要nock数据
function getProvideNockData() {
    var needNockData = false;
    if (process.argv.indexOf('nock') >= 0
        ||
        process.argv.indexOf('-nock') >= 0
        ||
        process.argv.indexOf('--nock') >= 0) {
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
            gateway = 'http://' + gatewayHost + ':' + gatewayPort;
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
    'system': {
        'elapseLogMinTime': 0,

        'caster': {
            properties: {
                'hazelcast.client.heartbeat.interval': 5000,
                'hazelcast.client.heartbeat.timeout': 60000
            },
            groupConfig: getHazelcastGroupConfig(),
            networkConfig: {
                'addresses': getHazelcastAddress(),
                'connectionAttemptLimit': Infinity,
                'connectionAttemptPeriod': 1000 * 10,
                'connectionTimeout': 5000,
                'redoOperation': true,
                'smartRouting': true,
                'socketOptions': {}
            },
            serializationConfig: {}
        },
    },
    //devserver的静态文件路径
    staticFileProxyDir: process.env.STATIC_FILE_PROXY_DIR || 'http://localhost:8081',
    //日志文件个个数
    logfileCount: process.env.LOGFILE_COUNT || 100,
    //日志的级别
    logLevel: process.env.LOG_LEVEL || 'DEBUG',
    //是否是正式环境
    isFormal: isFormal,
    // es地址
    esUrl: process.env.ES,//http://192.168.2.21:9200,
    //进程名
    processTitle: process.env.PROCESS_TITLE || 'ketao',
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
        casterMapName: process.env.CASTER_MAP_NAME || 'oplate_session',//hazelcast中的map名
        maxAge: process.env.SESSIONTTL || 60 * 60 * 1000, //session默认一小时
        secret: 'CV193WIC' //加密session id使用的秘钥
    },
    proxy: {
        'protocal': 'http://',
        'host': '172.19.104.108',
        'port': '8182'
    },
    //rest返回数据格式为json
    restJson: true,
    //默认rest请求超时时长
    restTimeout: 1000 * 30,
    //跟踪实例
    traceConfig: {
        zipkinUrl: process.env.ZIPKINURL || 'http://172.19.103.39:9002', //将跟踪记录到服务器的url
        serviceName: 'ketao_web'
    },
    //没有配置推送服务地址，并且从协调服务中根据id获取不到可用的服务地址时用的默认的推送服务地址
    pushServer: 'http://172.19.104.103:9093',//测试环境：http://172.19.104.108:9093
    coordinatorConfig: {
        // coordinator 服务地址连接
        coordinator: {
            // 设置域名或者host和port
            domain: coordinateAddress.domain || '',
            host: coordinateAddress.host || '172.19.103.22',//测试环境：172.19.103.39
            port: coordinateAddress.port || 8080
        },
        registerSelf: false,//是否注册本服务(nodejs)到服务注册中心
        token: '123'
    },
    appId: 'COM.ANTFACT.OPLATE.NOTIFY',//从协调服务中获取推送服务地址时所需的id
    loginParams: {
        //安全域Id,客套正式:34pj27enfq, 客套测试:34suklsvlP, curtao:34pj27enfq
        realm: process.env.LOGIN_REALM || '34suklsvlP',
        //应用Id, ketao:3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9 ,curtao:34pj27enfq34pj1oe3c4h91VbdhG4zxccX0Z3i2Z6eN
        clientId: process.env.LOGIN_CLIENT_ID || '3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9',
        //应用密钥, 客套正式:477qpz3uC5fZcaz0w1YloKWA, 客套测试:41yhR18RW4nebW305HAvf23t, curtao:0bMfdndoR4jPcH70Mm7SS1kg
        clientSecret: process.env.LOGIN_CLIENT_SECRET || '41yhR18RW4nebW305HAvf23t',
        grantType: process.env.LOGIN_GRANT_TYPE || 'client_credentials'//授权类型
    },
    //服务网关,测试环境：http://172.19.103.21:9191,正式：'http://gateway-ketao.antfact.com', curtao：http://gateway.curtao.com
    gateway: getGateway() || 'http://172.19.103.21:9191',
    metricAddress: process.env.METRIC_ADDRESS,//"http://172.19.104.253:8086/oplate_web",
    loggerTag: process.env.LOGGER_TAG || 'ketao-web',//日志标签,用来区分是oplate的还是ketao的
    errorMessagePath: path.join(__dirname, '../portal/lib/utils/errorCode.js'),//错误码处理文件路径，ant-auth-request中需要用
    siteID: process.env.SITE_ID || '1',//piwik需配置site_id,1:oplate,4:ketao
    pushServerAddress: process.env.PUSH_SERVER_ADDRESS || 'http://172.19.103.211:9093',//推送的服务地址（测试： http://172.19.103.211:9093，正式:http://notify-ketao.antfact.com:80）
    lang: process.env.OPLATE_LANG, //语言环境(优先)
    useSso: process.env.USESSO,//是否使用sso
    storageKey: process.env.storageKey || 'ketao-storage',//在localstorage中存储的key
    curtaoUrl: process.env.CURTAO_URL || 'www.curtao.com',//用来判断是否是curtao的环境,curtao的环境会展示新版登录注册界面
    timeStamp: new Date().valueOf()//时间戳（解决文件缓存的问题）
};

config.nockUrl = config.proxy.protocal + config.proxy.host + ':' + config.proxy.port;

module.exports = config;
