/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';
//var JSX = require('node-jsx').install({ extension: '.jsx' });
require('babel-core/register');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
global.__STYLE_COLLECTOR_MODULES__ = [];
global.__STYLE_COLLECTOR__ = '';
var LoginForm = React.createFactory(require('../../../../dist/server-render/login'));
var DesktopLoginService = require('../service/desktop-login-service');
var UserDto = require('../../../lib/utils/user-dto');
let BackendIntl = require('../../../../portal/lib/utils/backend_intl');
const Promise = require('bluebird');

/**
 * 首页
 * @param req
 * @param res
 */

exports.showLoginPage = function(req, res) {
    var loginErrorMsg = req.session.loginErrorMsg;
    if (loginErrorMsg) {
        delete req.session.loginErrorMsg;
    }
    //从session中获取上一次登录用户名
    var last_login_user = req.session.last_login_user || '';
    var obj = {
        username: last_login_user,
        loginErrorMsg: loginErrorMsg
    };
    //优先使用环境变量中设置的语言
    const loginLang = global.config.lang || req.query.lang || '';
    //session中存在stopcheck(使用ticket登录失败时，会加stopcheck参数)
    // 或者请求路径中包含stopcheck(超时后刷新界面时，转页到登录界面会加stopcheck参数)
    const stopcheck = req.session.stopcheck || req.query.stopcheck;
    //将当前的语言环境存入session中
    if (req.session) {
        req.session.lang = loginLang;
        req.session.save();
    }
    //非sso登录并且有用户名时，获取一次验证码
    if (!global.config.useSso && last_login_user) {
        getLoginCaptcha();
    } else {
        renderHtml();
    }
    //展示登录页面前先获取验证码
    function getLoginCaptcha() {
        DesktopLoginService.getLoginCaptcha(req, res, last_login_user).on('success', function(data) {
            obj.captchaCode = data ? data.data : '';
            renderHtml();
        }).on('error', function(errorObj) {
            renderHtml();
        });
    }

    function renderHtml() {
        var styleContent = global.__STYLE_COLLECTOR__;
        var formHtml = ReactDOMServer.renderToString(LoginForm(obj));
        var phone = '400-677-0986';
        var qq = '4006770986';
        let backendIntl = new BackendIntl(req);
        let hideLangQRcode = '';
        if (global.config.lang && global.config.lang === 'es_VE') {
            hideLangQRcode = 'true';
        }
        res.render('login/tpl/desktop-login', {
            styleContent: styleContent,
            loginForm: formHtml,
            loginErrorMsg: obj.loginErrorMsg,
            username: obj.username,
            captchaCode: obj.captchaCode || '',
            addShowingIoCode: global.config.formal,
            company: backendIntl.get('company.name', '© 蚁坊软件 湘ICP备14007253号-1'),
            hotline: backendIntl.get('companay.hotline', '服务热线: {phone}', {'phone': phone}),
            contact: backendIntl.get('company.qq', '企业QQ: {qq}', {'qq': qq}),
            siteID: global.config.siteID,
            lang: loginLang,
            hideLangQRcode: hideLangQRcode,
            clientId: global.config.loginParams.clientId,
            stopcheck: stopcheck,
            useSso: global.config.useSso
        });
    }
};
/*
 * 登录逻辑
 */
exports.login = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var captcha = req.body.retcode;
    //记录上一次登录用户名，到session中
    username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    req.session.last_login_user = username;
    DesktopLoginService.login(req, res, username, password, captcha)
        .on('success', loginSuccess(req, res))
        .on('error', loginError(req, res));
};
/*
 * sso登录逻辑
 */
exports.ssologin = function(req, res) {
    var ticket = req.query.t;
    if (!ticket) {
        req.session.stopcheck = 'true';
        let lang = req.session && req.session.lang || 'zh_CN';
        //登录界面，登录失败的处理
        res.redirect('/login?lang=' + lang);
    } else {
        DesktopLoginService.loginWithTicket(req, res, ticket)
            .on('success', loginSuccess(req, res))
            .on('error', loginError(req, res));
    }
};

//修改session数据
function modifySessionData(req, data) {
    var userData = UserDto.toSessionData(req, data);
    req.session['_USER_TOKEN_'] = userData['_USER_TOKEN_'];
    req.session.clientInfo = userData.clientInfo;
    req.session.user = userData.user;
}

//登录成功处理
function loginSuccess(req, res) {
    req.session.stopcheck = '';
    return function(data) {
        //修改session数据
        modifySessionData(req, data);
        //设置sessionStore，如果是内存session时，需要从req中获取
        global.config.sessionStore = global.config.sessionStore || req.sessionStore;
        req.session.save(function() {
            if (req.xhr) {
                //session失效时，登录成功后的处理
                res.status(200).json('success');
            } else {
                //登录界面，登录成功后的处理
                res.redirect('/');
            }
        });
    };
}
//登录失败处理
function loginError(req, res) {
    return function(data) {
        let lang = req.session && req.session.lang || 'zh_CN';
        req.session.stopcheck = 'true';
        let backendIntl = new BackendIntl(req);
        if (data && data.message) {
            req.session.loginErrorMsg = data.message;
        } else {
            req.session.loginErrorMsg = backendIntl.get('login.username.password.error', '用户名或密码错误');
        }
        req.session.save(function() {
            if (req.xhr) {
                //session失效时，登录失败后的处理
                res.status(500).json(data && data.message || backendIntl.get('login.password.error', '密码错误'));
            } else {
                //登录界面，登录失败的处理
                res.redirect('/login?lang=' + lang);
            }
        });
    };
}

//获取验证码
exports.getLoginCaptcha = function(req, res) {
    var type = req.query.type;
    var username = req.query.username || '';
    username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    if (!username) {
        res.status(400).send('need username parameter');
        return;
    }
    DesktopLoginService.getLoginCaptcha(req, res, username, type).on('success', function(data) {
        res.status(200).json(data ? data.data : '');
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//刷新验证码
exports.refreshCaptcha = function(req, res) {
    var type = req.query.type;
    var username = req.query.username || '';
    username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    if (!username) {
        res.status(400).send('need username parameter');
        return;
    }
    DesktopLoginService.refreshLoginCaptcha(req, res, username, type).on('success', function(data) {
        res.status(200).json(data ? data.data : '');
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//检查联系方式是否存在
exports.checkContactInfoExists = function(req, res) {
    DesktopLoginService.checkContactInfoExists(req, res).on('success', function(data) {
        if (typeof data === 'object') {
            //过滤掉无关字段
            data = {
                user_id: data.user_id,
                user_name: data.user_name,
            };
        } else {
            data = '';
        }
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//获取操作码
function getOperateCode(req, res) {
    return new Promise(function(resolve, reject) {
        const user_name = req.query.user_name;
        const captcha = req.query.captcha;
        DesktopLoginService.getOperateCode(req, res, user_name, captcha).on('success', function(data) {
            const operateCode = data && data.operate_code;
            resolve(operateCode);
        }).on('error', function(errorObj) {
            reject(errorObj);
        });
    });
}

//发送重置密码时的身份验证信息
exports.sendResetPasswordMsg = function(req, res) {
    //先获取操作码
    getOperateCode(req, res).then(function(operateCode) {
        const userName = req.query.user_name;
        const sendType = req.query.send_type;
        //发送信息
        DesktopLoginService.sendResetPasswordMsg(req, res, userName, sendType, operateCode).on('success', function(data) {
            if (!data) data = '';
            res.status(200).json(data);
        }).on('error', function(errorObj) {
            res.status(500).json(errorObj);
        });
    }).catch(function(errorObj) {
        res.status(500).json(errorObj);
    });
};

//获取凭证
exports.getTicket = function(req, res) {
    const user_id = req.query.user_id;
    const code = req.query.code;
    DesktopLoginService.getTicket(req, res, user_id, code).on('success', function(data) {
        if (!data) data = '';
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//重置密码
exports.resetPassword = function(req, res) {
    const user_id = req.query.user_id;
    const ticket = req.query.ticket;
    const new_password = req.query.new_password;
    DesktopLoginService.resetPassword(req, res, user_id, ticket, new_password).on('success', function(data) {
        if (!data) data = '';
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//获取扫描登录的二维码
exports.getLoginQRCode = function(req, res) {
    DesktopLoginService.getLoginQRCode(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj);
    });
};
//二维码登录
exports.loginByQRCode = function(req, res) {
    var qrcode = req.params.qrcode;
    DesktopLoginService.loginByQRCode(req, res, qrcode).on('success', function(data) {
        //修改session数据
        modifySessionData(req, data);
        //设置sessionStore，如果是内存session时，需要从req中获取
        global.config.sessionStore = global.config.sessionStore || req.sessionStore;
        req.session.save(function() {
            //登录界面，登录成功后的处理
            // res.redirect("/");
            res.status(200).json('success');
        });
    }).on('error', function(data) {
        res.status(500).json(data);
    });

};

/*
 * 微信登录逻辑
 */
exports.wechatLogin = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var captcha = req.body.retcode;
    //记录上一次登录用户名，到session中
    username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    req.session.last_login_user = username;
    DesktopLoginService.login(req, res, username, password, captcha)
        .on('success', wechatLoginSuccess(req, res))
        .on('error', wechatLoginError(req, res));
};

//修改session数据
function modifySessionData(req, data) {
    var userData = UserDto.toSessionData(req, data);
    req.session['_USER_TOKEN_'] = userData['_USER_TOKEN_'];
    req.session.clientInfo = userData.clientInfo;
    req.session.user = userData.user;
}

//登录成功处理
function wechatLoginSuccess(req, res) {
    return function(data) {
        //修改session数据
        modifySessionData(req, data);
        //设置sessionStore，如果是内存session时，需要从req中获取
        global.config.sessionStore = global.config.sessionStore || req.sessionStore;
        req.session.save(function() {
            //session失效时，登录成功后的处理
            res.status(200).json('success');
        });
    };
}

//登录失败处理
function wechatLoginError(req, res) {
    return function(data) {
        let backendIntl = new BackendIntl(req);
        if (data && data.message) {
            req.session.loginErrorMsg = data.message;
        } else {
            req.session.loginErrorMsg = backendIntl.get('login.username.password.error', '用户名或密码错误');
        }
        req.session.save(function() {
            //session失效时，登录失败后的处理
            res.status(500).json(data && data.message || backendIntl.get('login.password.error', '密码错误'));
        });
    };
}

