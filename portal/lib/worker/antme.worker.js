import antMeConnect from 'antme-sdk-js-biz-visitor';
import antmeStorage from 'antme-sdk-js-core/actors/util-storage.js';

let Antme = null;
let antmeListener = {};

// 初始化
function AntmeInit(url, forceLogin, appId) {
    antmeStorage.localStorage.initStore(() => {
        antMeConnect(url, {
            networkLogging: true,
            appId: appId
        }, forceLogin).then((antme) => {
            Antme = antme;
            console.log('初始化成功：', new Date());
            // 1.登录监听
            antme.on('need-login', () => {
                console.log('重新登陆：', new Date());
                // sso登陆
                self.postMessage({
                    type: 'need-login'
                });
            });

            // 多人登录
            antme.on('user-offline', (offline) => {
                offline = JSON.stringify(offline);
                self.postMessage({
                    isInit: true,
                    type: 'user-offline',
                    data: offline
                });
            });

            // 会话失效
            antme.on('user-session-invalid', () => {
                self.postMessage({
                    isInit: true,
                    type: 'user-session-invalid'
                });
            });

            // 2. 初始化请求失败监听
            antme.on('init-request-error', (error) => {
                console.log('init antme request error', error);
            });

            // 3.获取用户Id监听
            antme.STORE.User.SELF.on('user-id', (userId) => {
                self.postMessage({
                    isInit: true,
                    type: 'init-success',
                    mode: 'dialog',
                    data: JSON.stringify({
                        userId: userId
                    })
                });
            });
        });
    });
}

// Listener
// mode: message、user、group、dialog、org、dept、team
function AntmeListener(data) {
    if (data.type === 'on') {
        let callback = (obj) => {
            obj = JSON.stringify(obj);
            self.postMessage({
                type: 'on',
                data: obj,
                id: data.listenerId
            });
        };
        antmeListener[data.listenerId] = callback;
        if (data.mode === 'dialog') {
            Antme.STORE.Messaging.DIALOG.on(data.name, callback);
        } else if (data.mode === 'dept') {
            Antme.STORE.Group.DEPT.on(data.name, callback);
        } else if (data.mode === 'team') {
            Antme.STORE.Group.TEAM.on(data.name, callback);
        } else if (data.mode === 'user') {
            Antme.STORE.User.USER.on(data.name, callback);
        }
    } else if (data.type === 'off') {
        let callback = antmeListener[data.listenerId];
        if (data.mode === 'dialog') {
            Antme.STORE.Messaging.DIALOG.off(data.name, callback);
        } else if (data.mode === 'dept') {
            Antme.STORE.Group.DEPT.off(data.name, callback);
        } else if (data.mode === 'team') {
            Antme.STORE.Group.TEAM.off(data.name, callback);
        } else if (data.mode === 'user') {
            Antme.STORE.User.USER.off(data.name, callback);
        }
        delete antmeListener[data.listenerId];
    }
}

// Rpc接口
function AntmeRpc(data) {
    let arr = data.method.split('.');
    let ret, pre;

    arr.forEach((m) => {
        if (m) {
            if (ret) {
                pre = ret;
                ret = ret[m];
            } else {
                ret = pre = Antme[m];
            }
        }
    });
    if (ret && pre) {
        ret.apply(pre, data.params).then((retData) => {
            retData = JSON.stringify(retData);
            self.postMessage({
                id: data.requestId,
                type: data.method,
                data: retData
            });
        }).catch((err) => {
            console.error(`${data.method} request fail:`, err);
        });
    }
}

// Store
function AntmeStore(data) {
    let arr = data.method.split('.');
    let ret, pre;

    arr.forEach((m) => {
        if (m) {
            if (ret) {
                pre = ret;
                ret = ret[m];
            } else {
                ret = pre = Antme[m];
            }
        }
    });

    if (ret && pre) {
        let retData = ret.apply(pre, data.params);
        self.postMessage({
            id: data.storeId,
            type: data.method,
            data: JSON.stringify(retData)
        });
    }
}

onmessage = function(e) {
    if (e.data.method === 'init') {
        AntmeInit(e.data.url, e.data.forceLogin, e.data.appId);
    } else if (e.data.method === 'listener') {
        AntmeListener(e.data);
    } else {
        if (e.data.type === 'store') {
            AntmeStore(e.data);
        } else {
            AntmeRpc(e.data);
        }
    }
};
