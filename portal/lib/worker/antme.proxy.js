// import Commons from './commons';
import uuid from 'uuid/v4';
import AntmeSdkWorker from './antme.worker';

const AntmeProxy = function(options) {
    let self = this;
    self.antmeWorker = new AntmeSdkWorker();
    self.antmeRequest = {};
    self.antmeStore = {};
    self.antmeListener = {};
    self.rpcId = '';
    self.storeId = '';
    self.listenerId = '';

    self.antmeWorker.postMessage({
        method: 'init',
        url: options.url,
        forceLogin: options.forceLogin,
        appId: options.appId
    });

    self.antmeWorker.onmessage = function(e) {
        if (e.data.type === 'need-login') {
            options.ssoLoginCallback.call(this);
        } else if (e.data.type === 'user-offline') {
            options.offlineCallback.call(this, e.data.data);
        } else if (e.data.type === 'user-session-invalid') {
            options.sessionInvalidCallback.call(this, e.data.data);
        } else if (e.data.type === 'init-success') {
            options.initSuccessCallBack.call(this, JSON.parse(e.data.data));
        } else {
            e.data.data = e.data.data ? JSON.parse(e.data.data) : e.data.data;
            if (e.data.id.startsWith('listener:')) {
                self.antmeListener[e.data.id](e.data.data);
            } else if (e.data.id.startsWith('rpc:')) {
                self.antmeRequest[e.data.id](e.data.data);
            } else if (e.data.id.startsWith('store:')) {
                self.antmeStore[e.data.id](e.data.data);
            } else {
                console.log('antme worker onmessage error!');
            }
        }
    };
};

// antme rpc
AntmeProxy.prototype.rpc = function(method, params, callback) {
    let self = this;
    self.rpcId = 'rpc:' + uuid();
    self.antmeRequest[self.rpcId] = callback;
    self.antmeWorker.postMessage({
        type: 'rpc',
        requestId: self.rpcId,
        method: method,
        params: params
    });
};

// antme store
AntmeProxy.prototype.store = function(method, params, callback) {
    let self = this;
    self.storeId = 'store:' + uuid();
    self.antmeStore[self.storeId] = callback;
    self.antmeWorker.postMessage({
        type: 'store',
        storeId: self.storeId,
        method: method,
        params: params
    });
};

// antme listener on
// mode: message、user、group、dialog、antme、dept、team
AntmeProxy.prototype.on = function(name, mode, callback, callbackId) {
    let self = this;
    self.listenerId = 'listener:' + uuid();
    self.antmeListener[self.listenerId] = callback;
    callbackId(self.listenerId);
    self.antmeWorker.postMessage({
        type: 'on',
        listenerId: self.listenerId,
        name: name,
        mode: mode,
        method: 'listener'
    });
};

// antme listener off
AntmeProxy.prototype.off = function(name, mode, listenerId) {
    let self = this;
    self.antmeWorker.postMessage({
        type: 'off',
        name: name,
        mode: mode,
        listenerId: listenerId,
        method: 'listener'
    });
};

exports.init = function(options) {
    return new AntmeProxy(options);
};
