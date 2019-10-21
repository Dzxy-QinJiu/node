/*!
 * Copyright (c) 2010-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * sso-login.js
 * 使用方法：
 * import SSOClient from 'path to this';
 * // step 1: (init)
 * const ssoClient = new SSOClient({ssoOrigin,clientId,lang,callBackUrl});
 *
 * // step 2: (try auto login)
 * ssoClient.autoLogin().then((ticket)=>{
 *      window.location.href = callBackUrl + "?t=" + ticket;
 * }).catch((data)=>{
 *      ...
 * });
 *
 * // step 3: (submit)
 * ssoClient.login(username, password, captcha).then((ticket)=>{
 *      window.location.href = callBackUrl + "?t=" + ticket;
 * }).catch((data)=>{
 *      ...
 * });
 *
 * // step 4: (refresh captcha)
 * let captchaUrl = ssoClient.buildCaptchaUrl()
 *
 * Created by wuyaoqian on 2017/7/18.
 */

const IFRAME_NAME = 'sso-login-iframe';
const FORM_NAME = 'sso-login-form';

const Util = {
    /**
     * 生成一个 form 表单
     * @param formName
     * @return {Element}
     */
    createForm(formName) {
        let form = document.getElementById(formName);
        if (form) {
            form.parentNode.removeChild(form);
        }
        form = document.createElement('form');
        form.height = 0;
        form.width = 0;
        form.style.display = 'none';
        form.name = formName;
        form.id = formName;
        form.addInput = function(name, value, type) {
            type = type || 'text';
            let input = this.getElementsByTagName('input')[name];
            if (input) {
                input.parentNode.removeChild(input);
            }
            input = document.createElement('input');
            this.appendChild(input);
            input.id = name;
            input.name = name;
            input.type = type;
            input.value = value;
        };
        document.body.appendChild(form);
        return form;
    },
    /**
     * 创建Iframe
     * @param frameName
     * @param readyCallback
     * @param contentLoadCallback
     * @return {Element}
     */
    createIFrame(frameName, readyCallback, contentLoadCallback) {
        let url = 'javascript:false;';
        let frame = document.getElementById(frameName);
        if (frame) {
            frame.parentNode.removeChild(frame);
        }
        frame = document.createElement('iframe');
        frame.height = 0;
        frame.width = 0;
        frame.style.display = 'none';
        frame.name = frameName;
        frame.id = frameName;
        frame.src = url;
        frame.count = 0;
        frame.onload = function() {
            frame.count += 1;
            if (frame.count === 1 && typeof readyCallback === 'function') {
                readyCallback(frame);
            }
            if (frame.count === 2 && typeof contentLoadCallback === 'function') {
                frame.onload = null;
                contentLoadCallback(frame);
            }
        };
        document.body.appendChild(frame);
        return frame;
    },
    /**
     * 通过 iframe 发送消息
     * @param url
     * @param form
     * @param callback
     */
    sendByIFrame(url, form, callback) {
        let originRegex = Util.getOriginRegex(url), isFired, cb = function() {
                if (!isFired) {
                    isFired = true;
                    callback.apply(this, Array.prototype.slice.call(arguments, 0));
                }
            }, begin = Date.now();
        if (window.__messageListener__) {
            window.removeEventListener('message', window.__messageListener__, false);
        }
        clearTimeout(window.__iframeTimeout__);
        if (form) {
            form.method = 'post';
            form.action = url;
            form.target = IFRAME_NAME;
            url = null;
        }
        Util.createIFrame(IFRAME_NAME, function(frame) {
            // 监听
            window.addEventListener('message', window.__messageListener__ = (e) => {
                if (!originRegex.test(e.origin)) {return;}
                try {cb(JSON.parse(e.data));} catch (e) {cb({'type': 'parse-error'});}
            }, false);
            // 使用 form 提交，或改变 iframe 的 src 地址
            window.__iframeTimeout__ = setTimeout(() => {
                if (form) {
                    form.submit();
                    if (form.removeFormAfterSubmit) {
                        setTimeout(() => {
                            if (form && form.parentNode) {
                                form.parentNode.removeChild(form);
                            }
                            form = null;
                        }, 0);
                    }
                } else if (url) {
                    frame.src = url;
                }
            });
        }, () => {
            // iframe.onload 后的延迟检测
            setTimeout(() => {
                // 如果大于两分钟，则超时
                if ((Date.now() - begin) >= 1000 * 60 * 2) {
                    cb({'type': 'timeout'});
                }
                // 否则，返回内容非法
                else {
                    cb({'type': 'invalid-content'});
                }
            }, 5 * 1000);
        });
    },
    /**
     * 获取 url 中的域名部分
     * @param url
     * @return {string|*}
     */
    getOrigin(url) {
        return url.substr(0, url.indexOf('/', 8)) || url;
    },
    /**
     * 获取 url 中的域名部分的正则
     * @param url
     * @return {RegExp}
     */
    getOriginRegex(url) {
        let regexStr = (url.substr(0, url.indexOf('/', 8)) || url)
            .replace(/\/\/www\./i, '//')
            .replace(/\./g, '\\\.')
            .replace('//', '//(.*\\\.)?')
            .replace(/\//g, '\\\/');
        regexStr = '^' + regexStr + '$';
        return new RegExp(regexStr, 'i');
    },
    /**
     * 自动处理第3方cookies的相关问题（注意：需要fetchStatus 或 autoLogin的失败方法中才可调用处理）
     * @param instance
     * @param data
     * @param reject
     */
    autoCheckAndProcessThirdPartyCookies(instance, data, reject) {
        if (data && !data.cookies && !sessionStorage.getItem('tryFix3rdCookie')) {
            // 是 safari 浏览器，则自动尝试解决第三方Cookies的写入与读取（注意：在chrome中，如果禁用了，这个方法也不能解决）
            if (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1) {
                return instance.checkThirdPartyCookieIsSupport().then(() => {
                    reject(data);
                }).catch(() => {
                    sessionStorage.setItem('tryFix3rdCookie', true);
                    instance.fixThirdPartyCookies();
                });
            }
        }
        reject(data);
    }
};

class SSO {
    /**
     * opt {object} {
     *      ssoOrigin: "",          // SSO 服务器的域名, 如：https://sso.eefung.com
     *      clientId: "",           // 回调应用ClientId
     *      lang: "",               // 回调应用当前使用的语言选择
     *      callBackUrl: ""         // 回调地址,
     * }
     * @param opt
     * @param obj {object} {
     *      autoLoginPath: "",      // 自动登录地址(ssoOrigin + autoLoginPath)(覆盖默认的)
     *      quickLoginPath: "",     // 快速登录地址(ssoOrigin + quickLoginPath)(覆盖默认的)
     *      ssoCheckPath: "",       // 验证SSO有效性地址(ssoOrigin + ssoCheckPath)(覆盖默认的)
     *      loginPath: "",          // 通过 SSO 登录的地址(ssoOrigin + loginPath)(覆盖默认的)
     *      captchaPath: "",        // 刷新验证码的地址(ssoOrigin + captchaPath)(覆盖默认的)
     *      check3dCookiePath: "",  // 检测第3方cookies的地址(ssoOrigin + check3dCookiePath)(覆盖默认的)
     *      fix3dCookiePath: "",    // 修复第3方cookies的地址(ssoOrigin + fix3dCookiePath)(覆盖默认的)
     *      captchaWidth: 0,        // 验证码的宽
     *      captchaHeight: 0        // 验证码的高
     * }
     */
    constructor(opt, obj) {
        let overwrite = obj || {};
        this.autoLoginUrl = opt.ssoOrigin + (overwrite.autoLoginPath || '/ticket-check');
        this.quickLoginUrl = opt.ssoOrigin + (overwrite.quickLoginPath || '/quick-check');
        this.ssoCheckUrl = opt.ssoOrigin + (overwrite.ssoCheckPath || '/sso-check');
        this.loginUrl = opt.ssoOrigin + (overwrite.loginPath || '/user-validate');
        this.captchaUrl = opt.ssoOrigin + (overwrite.captchaPath || '/login-captcha');
        this.checkThirdPartyCookieUrl = opt.ssoOrigin + (overwrite.check3dCookiePath || '/check-3rd-cookies');
        this.solveThirdPartyCookieUrl = opt.ssoOrigin + (overwrite.fix3dCookiePath || '/fix-3rd-cookies');
        this.clientId = opt.clientId || '';
        this.lang = opt.lang || '';
        this.callBackUrl = encodeURIComponent(opt.callBackUrl || '');
        this.captchaWidth = overwrite.captchaWidth || '';
        this.captchaHeight = overwrite.captchaHeight || '';
    }

    /**
     * 生成一个刷新验证码的地址
     * @return {string}
     */
    buildCaptchaUrl() {
        return this.captchaUrl + '?cid=' + this.clientId + '&cw=' + this.captchaWidth + '&ch=' + this.captchaHeight + '&_=' + Date.now();
    }

    /**
     * 自动登录
     * @return {Promise<Object>}
     */
    autoLogin() {
        return new Promise((resolve, reject) => {
            Util.sendByIFrame(
                this.autoLoginUrl + '?url=' + this.callBackUrl + '&cid=' + this.clientId + '&cw=' + this.captchaWidth + '&ch=' + this.captchaHeight,
                null, (data) => {
                    if (data && data.ticket) {
                        resolve(data.ticket);
                    } else {
                        // data: {error, pos, username, captcha, cookies:boolean, type:invalid-content|timeout|parse-error}
                        Util.autoCheckAndProcessThirdPartyCookies(this, data, reject);
                    }
                }
            );
        });
    }

    /**
     * 快速登录
     * @return {Promise<Object>}
     */
    quickLogin() {
        return new Promise((resolve, reject) => {
            Util.sendByIFrame(
                this.quickLoginUrl + '?url=' + this.callBackUrl + '&cid=' + this.clientId + '&cw=' + this.captchaWidth + '&ch=' + this.captchaHeight,
                null, (data) => {
                    if (data && data.ticket) {
                        resolve(data.ticket);
                    } else {
                        // {error, pos, captcha, type:invalid-content|timeout|parse-error|expired|other-error|permission-error}
                        reject(data);
                    }
                }
            );
        });
    }

    /**
     * 获取 SSO 状态
     * @return {Promise<Object>}
     */
    fetchStatus() {
        return new Promise((resolve, reject) => {
            Util.sendByIFrame(
                this.ssoCheckUrl + '?url=' + this.callBackUrl + '&cid=' + this.clientId + '&cw=' + this.captchaWidth + '&ch=' + this.captchaHeight,
                null, (data) => {
                    if (data && data.status && data.username) {
                        resolve({username: data.username});
                    } else {
                        // data: {status:false, captcha, cookies:boolean, type:invalid-content|timeout|parse-error}
                        Util.autoCheckAndProcessThirdPartyCookies(this, data, reject);
                    }
                }
            );
        });
    }

    /**
     * 检测当前浏览器是否支持第三方Cookies的写入
     * 注意：这个方法必须是在调用了 fetchStatus 或 autoLogin 的返回失败的结果（且 cookies=false ）后调用才会有效
     */
    checkThirdPartyCookieIsSupport() {
        return new Promise((resolve, reject) => {
            Util.sendByIFrame(this.checkThirdPartyCookieUrl + '?url=' + this.callBackUrl, null, (data) => {
                if (data && data.support) { resolve(true); } else { reject(false); }
            });
        });
    }

    /**
     * 修复第三方Cookies无法访问的问题（一般是 safari 浏览器）
     */
    fixThirdPartyCookies(url) {
        window.location.href = this.solveThirdPartyCookieUrl + '?url=' + encodeURIComponent(url || window.location.href);
    }

    /**
     * 登录（直接通过用户名与密码）
     * @param username
     * @param password
     * @param captcha
     * @return {*}
     */
    login(username, password, captcha) {
        let form = Util.createForm(FORM_NAME);
        form.addInput('username', username);
        form.addInput('password', password);
        form.addInput('url', this.callBackUrl, 'hidden');
        form.addInput('cid', this.clientId, 'hidden');
        form.addInput('lang', this.lang, 'hidden');
        form.addInput('cw', this.captchaWidth, 'hidden');
        form.addInput('ch', this.captchaHeight, 'hidden');
        form.addInput('type', 1, 'hidden');
        if (captcha) {
            form.addInput('captcha', captcha);
        }
        form.removeFormAfterSubmit = true;
        return this.loginByForm(form);
    }

    /**
     * 登录（通过表单）
     * @param form
     * @return {Promise}
     */
    loginByForm(form) {
        return new Promise((resolve, reject) => {
            Util.sendByIFrame(this.loginUrl, form, (data) => {
                if (data && data.ticket) {
                    resolve(data.ticket);
                } else {
                    // {error, pos, captcha, type:invalid-content|timeout|parse-error}
                    reject(data);
                }
            });
        });
    }

}

module.exports = SSO;
