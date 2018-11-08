/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';

/**
 * 请求路径 - login
 */

module.exports = {
    module: 'login/action/desktop-login-controller',
    routes: [{
        'method': 'get',
        'path': '/login',
        'handler': 'showLoginPage',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'post',
        'path': '/login',
        'handler': 'login',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'get',
        'path': '/ssologin',
        'handler': 'ssologin',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'get',
        'path': '/loginCaptcha',
        'handler': 'getLoginCaptcha',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'get',
        'path': '/refreshCaptcha',
        'handler': 'refreshCaptcha',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'post',
        'path': '/login_QR_code',
        'handler': 'getLoginQRCode',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'post',
        'path': '/QR_code/login/:qrcode',
        'handler': 'loginByQRCode',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'post',
        'path': '/wechatLogin',
        'handler': 'wechatLogin',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'get',
        'path': '/company/name/validate',
        'handler': 'getCompanyByName',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'get',
        'path': '/phone/validate_code',
        'handler': 'getVertificationCode',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'get',
        'path': '/phone/code/validate',
        'handler': 'validatePhoneCode',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'post',
        'path': '/account/register',
        'handler': 'registerAccount',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'get',
        'path': '/page/login/wechat',
        'handler': 'wechatLoginPage',
        'passport': {
            'needLogin': false
        }
    },{
        'method': 'get',
        'path': '/login/wechat',
        'handler': 'loginWithWechat',
        'passport': {
            'needLogin': false
        }
    }]
};
