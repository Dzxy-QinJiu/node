/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/9/12.
 */

// 引入 sso-login.js
// import SSOClient from 'component-util/lib/sso-login';
// import SSOClient from './sso-login-es6';
import SSOClient from '@component-util/sso-login';

let lang = '', clientId, callBackUrl = '/ssologin';
let hasWindow = !(typeof window === 'undefined');

if (hasWindow) {
    lang = window.Oplate && window.Oplate.lang || 'zh_CN';
    clientId = window.Oplate && window.Oplate.clientId || '';
    callBackUrl = window.location.origin + '/ssologin';
}
const ssoLogin = new SSOClient({
    // SSO所在的服务器
    ssoOrigin: window.Oplate.ssoUrl,//'https://sso.curtao.com',
    // 待接入应用的 client_id
    clientId: clientId,
    // 指定语言（用于登录失败时，返回的出错提示所使用的语言，如：zh-CN）
    lang: lang.replace('_', '-'),
    // 登录成功后的回调地址
    callBackUrl: callBackUrl
}, {
    // 验证码的宽度
    captchaWidth: 120,
    // 验证码的高度
    captchaHeight: 40
});

// 生成一张验证码图片地址（用于点击验证码的刷新之用）
const buildRefreshCaptchaUrl = function() {
    return ssoLogin.buildCaptchaUrl();
};

export {callBackUrl, ssoLogin, buildRefreshCaptchaUrl};