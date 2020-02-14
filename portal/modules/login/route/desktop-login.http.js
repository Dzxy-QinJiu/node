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
    routes: [{//登录界面
        'method': 'get',
        'path': '/login',
        'handler': 'showLoginPage',
        'passport': {
            'needLogin': false
        }
    }, {//注册界面
        'method': 'get',
        'path': '/register',
        'handler': 'showRegisterPage',
        'passport': {
            'needLogin': false
        }
    }, {//用户协议
        'method': 'get',
        'path': '/user/agreement',
        'handler': 'showUserAgreementPage',
        'passport': {
            'needLogin': false
        }
    }, {//隐私政策
        'method': 'get',
        'path': '/privacy/policy',
        'handler': 'showPrivacyPolicy',
        'passport': {
            'needLogin': false
        }
    }, {
        'method': 'get',
        'path': '/wechat_bind',
        'handler': 'showWechatBindPage',
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
    }, {//微信小程序用账号、密码登录的接口
        'method': 'post',
        'path': '/wechatLogin',
        'handler': 'wechatLogin',
        'passport': {
            'needLogin': false
        }
    }, {//chrome扩展插件用账号、密码登录的接口
        'method': 'post',
        'path': '/extensionLogin',
        'handler': 'extensionLogin',
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
    }, {// 检查电话是否已经被注册过
        'method': 'get',
        'path': '/phone/registed/check',
        'handler': 'checkPhoneIsRegisted',
        'passport': {
            'needLogin': false
        }
    },{
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
    }, {//注册，短信验证码验证失败三次后获取图片验证码
        'method': 'get',
        'path': '/register/captchaCode',
        'handler': 'getRegisterCaptchaCode',
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
    },{//通过微信二维码登录或绑定时的接口
        'method': 'get',
        'path': '/wechat/login_bind/code',
        'handler': 'wechatLoginBindByCode',
        'passport': {
            'needLogin': false
        }
    },{
        'method': 'get',
        'path': '/login/wechat/miniprogram',
        'handler': 'loginWithWechatMiniprogram',
        'passport': {
            'needLogin': false
        }
    },{//微信小程序用已有账号绑定微信并登录
        'method': 'post',
        'path': '/bind/login/wechat/miniprogram',
        'handler': 'bindLoginWechatMiniprogram',
        'passport': {
            'needLogin': false
        }
    },{//微信小程序注册新账号绑定微信并登录
        'method': 'post',
        'path': '/register/login/wechat/miniprogram',
        'handler': 'registerLoginWechatMiniprogram',
        'passport': {
            'needLogin': false
        }
    },{//web用已有账号绑定微信并登录
        'method': 'post',
        'path': '/bind/login/wechat',
        'handler': 'bindLoginWechat',
        'passport': {
            'needLogin': false
        }
    },{//web注册新账号绑定微信并登录
        'method': 'post',
        'path': '/register/login/wechat',
        'handler': 'registerLoginWechat',
        'passport': {
            'needLogin': false
        }
    },{//解绑微信
        'method': 'post',
        'path': '/wechat/unbind',
        'handler': 'unbindWechat',
        'passport': {
            'needLogin': true
        }
    },{//登录后判断是否绑定微信
        'method': 'get',
        'path': '/wechat/bind/check/login',
        'handler': 'checkLoginWechatIsBind',
        'passport': {
            'needLogin': true
        }
    },{//获取组织的信息
        'method': 'get',
        'path': '/organization/info',
        'handler': 'getOrganization',
        'passport': {
            'needLogin': true
        }
    },{//获取session中的用户信息
        'method': 'get',
        'path': '/session/userData',
        'handler': 'getSessionUserData',
        'passport': {
            'needLogin': false
        }
    },{//找回密码-检查系统中有没有手机或邮箱对应的账号
        'method': 'get',
        'path': '/check_contact_info_exists',
        'handler': 'checkContactInfoExists',
        'passport': {
            'needLogin': false
        }
    },{//找回密码-发送手机/邮箱验证码
        'method': 'get',
        'path': '/send_reset_password_msg',
        'handler': 'sendResetPasswordMsg',
        'passport': {
            'needLogin': false
        }
    },{//找回密码-身份验证
        'method': 'get',
        'path': '/get_reset_password_ticket',
        'handler': 'getTicket',
        'passport': {
            'needLogin': false
        }
    },{//找回密码-重置密码
        'method': 'get',
        'path': '/reset_password_with_ticket',
        'handler': 'resetPassword',
        'passport': {
            'needLogin': false
        }
    }]
};