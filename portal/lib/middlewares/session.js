var expires = config.session.maxAge;
var sessionMapName = config.session.casterMapName;
var exp_session = require('express-session');
var sessionUtils = require('../utils/session-utils');
var sessionKey = 'sid';
var store = null;
var CasterClientSDK = require('caster-client-sdk');

//有这些参数，就视为使用内存模式
if (process.argv.indexOf('m') < 0
    &&
    process.argv.indexOf('-m') < 0
    &&
    process.argv.indexOf('--m') < 0
    &&
    process.argv.indexOf('memory') < 0
    &&
    process.argv.indexOf('-memory') < 0
    &&
    process.argv.indexOf('--memory') < 0) {
    var CasterClientStore = CasterClientSDK.expressStore(exp_session);

    store = new CasterClientStore({
        resaveTime: 1000 * 20,
        connectedCallback: function() {
            //开始监听 Session 的过期或被删除事件
            sessionUtils.startWatchSessionExpire(this.casterMapInstance);
        }
    }, sessionMapName, expires);
}

var sessionOptions = {
    resave: true,
    saveUninitialized: false,
    secret: config.session.secret,
    key: sessionKey,
    rolling: true,
    store: store,
    cookie: { httpOnly: false }
};
//设置store
config.sessionStore = store;
var sessionMiddleware = exp_session(sessionOptions);
module.exports = sessionMiddleware;
