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
    },{
        'method': 'post',
        'path': '/QR_code/login/:qrcode',
        'handler': 'loginByQRCode',
        'passport': {
            'needLogin': false
        }
    }]
};
