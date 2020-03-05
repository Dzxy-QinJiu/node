/**
 * 配置信息
 * zipkin、调用链跟踪记录（只有线上的正式环境有的配置）
     ZIPKINURL：http://172.19.103.39:9002
     METRIC_ADDRESS：http://172.19.103.123:8086/oplate_web
 *
 *
 */
var path = require('path');
//是否是线上环境  isProduction=true表示是线上环境
var webpackMode = 'dev', isProduction = true;
//是否正式环境
var isFormal = 'true';

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
    // ketao的caster地址和端口（用来给：蚁坊识微官网、公共应用（告警、sso等））
    //部署环境IP：p-caster01,p-caster02,p-caster03,p-caster04 本地测试IP: 10.20.2.124,10.20.2.125,10.20.2.126,10.20.2.127
    var casterIP = process.env.CASTER_IP || '10.20.2.124,10.20.2.125,10.20.2.126,10.20.2.127';
    var casterPort = process.env.CASTER_PORT || '5762,5762,5762';
    var ipArray = casterIP.split(','), portArray = casterPort.split(',');
    return ipArray.map(function(ip, idx) {
        return {host: ip, port: portArray[idx]};
    });
}
//获取hazelcast的认证信息
function getHazelcastGroupConfig() {
    //ketao的caster的用户名和密码：caster-eefung-session
    return {'name': process.env.CASTER_USERNAME || 'caster-eefung-session', 'password': process.env.CASTER_PASSWOR || 'caster-eefung-session'};
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
    loginParams: {
        //安全域Id
        realm: process.env.LOGIN_REALM || '34pj27enfq',
        //应用Id
        clientId: process.env.LOGIN_CLIENT_ID || '3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9',
        //应用密钥
        clientSecret: process.env.LOGIN_CLIENT_SECRET || '477qpz3uC5fZcaz0w1YloKWA',
        grantType: process.env.LOGIN_GRANT_TYPE || 'client_credentials'//授权类型
    },
    //服务网关,测试环境：https://gateway-dev.curtao.com,正式：'http://gateway-ketao.antfact.com', exp环境：http://10.20.2.57:9090
    gateway: getGateway() || 'http://gateway-ketao.antfact.com',
    metricAddress: process.env.METRIC_ADDRESS,//"http://172.19.104.253:8086/oplate_web",
    loggerTag: process.env.LOGGER_TAG || 'ketao-web',//日志标签,用来区分是oplate的还是ketao的
    errorMessagePath: path.join(__dirname, '../portal/lib/utils/errorCode.js'),//错误码处理文件路径，ant-auth-request中需要用
    siteID: process.env.SITE_ID || '1',//piwik需配置site_id,1:oplate,4:ketao
    pushServerAddress: process.env.PUSH_SERVER_ADDRESS || 'http://10.20.1.184:9093',//推送的服务地址（测试： http://10.20.1.184:9093，正式:http://notify-ketao.antfact.com:80）
    lang: process.env.OPLATE_LANG, //语言环境(优先)
    useSso: process.env.USESSO,//是否使用sso
    ssoUrl: process.env.SSO_URL || 'https://sso-dev.curtao.com',//正式：https://sso.curtao.com，测试：https://sso-dev.curtao.com
    storageKey: process.env.storageKey || 'ketao-storage',//在localstorage中存储的key
    curtaoUrl: process.env.CURTAO_URL || 'csm.curtao.com',//用来判断是否是curtao的环境,curtao的环境会展示新版登录注册界面
    timeStamp: new Date().valueOf(),//时间戳（解决文件缓存的问题）
    cashClientId: process.env.CASH_CLIENT_ID || '34pj27enfq347ahnfii2SyHi54yv4wO8Qz0kMp6Ow7F',//营收中心应用id
    callerClientId: process.env.CALLER_CLIENT_ID || '34pj27enfq348ma67fo1PzXi4eNV4EOcik0gldrFHuR',//呼叫中心应用id
};

config.nockUrl = config.proxy.protocal + config.proxy.host + ':' + config.proxy.port;

module.exports = config;
