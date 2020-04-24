/**
 * 公用的一些工具类方法
 * Created by wuyaoqian on 14-4-17.
 */

'use strict';

var _ = require('lodash');

var HtmlUtil = {
    /**
     * 将 html标签符号 转化为 html转义符号
     * @param content
     * @param useDefaultValue
     * @returns {*}
     */
    escape: function(content, useDefaultValue) {
        return _.isString(content) ? content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : (useDefaultValue ? '' : undefined);
    },
    /**
     * 将 html转义符号 转化为 html标签符号
     * @param content
     * @param useDefaultValue
     * @returns {*}
     */
    unescape: function(content, useDefaultValue) {
        return _.isString(content) ? content.replace(/\&lt;/g, '<').replace(/\&gt;/g, '>') : (useDefaultValue ? '' : undefined);
    }
};

var IPUtil = {
    /**
     * 从 request 对象中获取 客户端IP
     * @param req
     * @returns {string} ip地址
     */
    getClientIp: function(req) {
        //如果有手动传入的，优先用手动传入的user_ip
        if (req && req.headers && req.headers.user_ip) {
            return req.headers.user_ip;
        }
        if (!req || !req.headers || !req.connection || !req.socket) {
            return '0.0.0.0';
        }
        var ip = req.headers['x-real-ip'] || req.header('x-forwarded-for');
        if (ip) {
            var forwardedIps = ip.split(',');
            ip = forwardedIps[0];
        }
        if (!ip) {
            ip = req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                (req.connection.socket ? (req.connection.socket.remoteAddress ? req.connection.socket.remoteAddress : '0.0.0.0') : '0.0.0.0');
            var remoteIps = ip.split(':');
            ip = remoteIps[remoteIps.length - 1] ? remoteIps[remoteIps.length - 1] : ip;
        }
        return ip;
    },
    /**
     * 获取本机ip地址
     * @returns {Array}
     */
    getServerAddresses: function() {
        var os = require('os');
        var ifaces = os.networkInterfaces();
        var addresses = [];
        Object.keys(ifaces).forEach(function(ifname) {
            ifaces[ifname].forEach(function(iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    return;
                }
                addresses.push(iface.address);
            });
        });
        return addresses;
    },
    /**
     * 获取本机以192.168.开头的ip
     * @returns  string
     */
    getServerIp: function() {
        var addresses = this.getServerAddresses();
        for (var i = 0; i < addresses.length; i++) {
            if (/^192\.168\./.test(addresses[i])) {
                return addresses[i];
            }
        }
        return '127.0.0.1';
    },
    /**
     * 如果当前机器ip有以172.19开头的，说明是工程中心的，返回true
     * @returns {boolean}
     */
    isProductionEnvironment: function() {
        var addresses = this.getServerAddresses();
        for (var i = 0, len = addresses.length; i < len; i++) {
            var address = addresses[i];
            if (!/^192\.168\./.test(address)) {
                return true;
            }
        }
        return false;
    }
};


var fs = require('fs');
var FileUtil = {
    /**
     * 同步检测文件或目录是否存在
     * @param target
     * @returns {boolean}
     */
    existSync: function(target) {
        try {
            fs.accessSync(target, fs.F_OK);
            return true;
        } catch (e) {
            return false;
        }
    }
};

var methodUtil = {
    //是否是curtao
    isCurtao: function(req) {
        return req.hostname === global.config.curtaoUrl;
    },
    //移除联系方式
    removeContactWay: function(contactList) {
        return _.map(contactList, contact => {
            delete contact.phone;
            delete contact.email;
            delete contact.qq;
            delete contact.weChat;
            return contact;
        });
    }
};

var CONSTS = {
    WELCOME_PAGE_FIELD: 'no_show_boot_complete_set_recommend'
};

module.exports = {
    html: HtmlUtil,
    ip: IPUtil,
    file: FileUtil,
    method: methodUtil,
    CONSTS: CONSTS
};