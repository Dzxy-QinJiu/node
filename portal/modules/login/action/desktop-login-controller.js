/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
//var JSX = require('node-jsx').install({ extension: '.jsx' });
require('babel-core/register');
var React = require("react");
var ReactDOMServer = require('react-dom/server');
var LoginForm = React.createFactory(require('../../../../dist/server-render/login'));
var DesktopLoginService = require("../service/desktop-login-service");
var UserDto = require("../../../lib/utils/user-dto");
var CommonErrorCodeMap = require("../../../../conf/errorCode/CommonErrorCode");
var appToken = "";//应用token，获取一次后，保存起来
let BackendIntl = require("../../../../portal/lib/utils/backend_intl");

/*
 * login page handler.
 */
var EXPIRE_TOKEN_CODE = "11012",//token过期
    INVALID_TOKEN_CODE = "11011";//token不存在
//错误信息提示
function getErrorMsg(req) {
    let backendIntl = new BackendIntl(req);
    return backendIntl.get("login.fail.login", "登录服务暂时不可用，请稍后重试");
}
//获取应用token
function getAppToken(req, res, successFunc, errorFunc) {
    //获取验证码之前先获取所需AppToken
    DesktopLoginService.getAppToken(req, res).on("success", function (data) {
        appToken = data && data.access_token ? data.access_token : "";
        if (successFunc instanceof Function) {
            successFunc.call(this, appToken);
        }
    }).on("error", function (errorObj) {
        if (errorFunc instanceof Function) {
            errorFunc.call(this, errorObj);
        }
    });
}
exports.showLoginPage = function (req, res) {
    var loginErrorMsg = req.session.loginErrorMsg;
    if (loginErrorMsg) {
        delete req.session.loginErrorMsg;
    }
    //从session中获取上一次登录用户名
    var last_login_user = req.session.last_login_user || '';
    var obj = {
        loginErrorMsg: loginErrorMsg,
        username: last_login_user
    };
    //优先使用环境变量中设置的语言
    const loginLang = global.config.lang || req.query.lang || "";
    //将当前的语言环境存入session中
    if (req.session) {
        req.session.lang = loginLang;
        req.session.save();
    }
    function renderHtml() {
        var formHtml = ReactDOMServer.renderToString(LoginForm(obj));
        var phone = '400-677-0986';
        var qq = '4006770986';
        let backendIntl = new BackendIntl(req);
        let hideLangQRcode = '';
        if (global.config.lang && global.config.lang == "es_VE") {
            hideLangQRcode = 'true';
        }
        res.render('login/tpl/desktop-login', {
            loginForm: formHtml,
            loginErrorMsg: obj.loginErrorMsg,
            username: obj.username,
            captchaCode: obj.captchaCode || "",
            addShowingIoCode: global.config.formal,
            company: backendIntl.get("company.name", "© 蚁坊软件 湘ICP备14007253号-1"),
            hotline: backendIntl.get("companay.hotline", "服务热线: {phone}", {'phone': phone}),
            contact: backendIntl.get("company.qq", "企业QQ: {qq}", {'qq': qq}),
            siteID: global.config.siteID,
            lang: loginLang,
            hideLangQRcode: hideLangQRcode,
            projectName: global.config.processTitle || "oplate"
        });
    }

    if (last_login_user) {
        if (appToken) {
            getLoginCaptcha(appToken);
        } else {
            //获取验证码之前先获取所需AppToken
            getAppToken(req, res, getLoginCaptcha, function (errorObj) {
                obj.loginErrorMsg = getErrorMsg(req);
                renderHtml();
            });
        }
    } else {
        renderHtml();
    }
    //展示登录页面前先获取验证码
    function getLoginCaptcha(appToken) {
        DesktopLoginService.getLoginCaptcha(req, res, last_login_user, appToken, loginLang).on("success", function (data) {
            obj.captchaCode = data ? data.data : "";
            renderHtml();
        }).on("error", function (errorObj) {
            if (errorObj && (errorObj.message == CommonErrorCodeMap.getConfigJson(loginLang)[EXPIRE_TOKEN_CODE].message
                || errorObj.message == CommonErrorCodeMap.getConfigJson(loginLang)[INVALID_TOKEN_CODE].message)) {
                //应用token过期后，需重新获取应用token
                getAppToken(req, res, getLoginCaptcha, function (errorObj) {
                    obj.loginErrorMsg = getErrorMsg(req);
                    renderHtml();
                });
            } else {
                obj.loginErrorMsg = getErrorMsg(req);
                renderHtml();
            }
        });
    }

};
/*
 * 登录逻辑
 */
exports.login = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var captcha = req.body.retcode;
    //记录上一次登录用户名，到session中
    username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    req.session.last_login_user = username;
    DesktopLoginService.login(req, res, username, password, captcha).on("success", function (data) {
        //修改session数据
        modifySessionData(req, data);
        //设置sessionStore，如果是内存session时，需要从req中获取
        global.config.sessionStore = global.config.sessionStore || req.sessionStore;
        req.session.save(function () {
            if (req.xhr) {
                //session失效时，登录成功后的处理
                res.status(200).json("success");
            } else {
                //登录界面，登录成功后的处理
                res.redirect("/");
            }
        });
    }).on("error", function (data) {
        let lang = req.session && req.session.lang || "zh_CN";
        let backendIntl = new BackendIntl(req);
        if (data && data.message) {
            req.session.loginErrorMsg = data.message;
        } else {
            req.session.loginErrorMsg = backendIntl.get("login.username.password.error", "用户名或密码错误");
        }
        req.session.save(function () {
            if (req.xhr) {
                //session失效时，登录失败后的处理
                res.status(500).json(data && data.message || backendIntl.get("login.password.error", "密码错误"));
            } else {
                //登录界面，登录失败的处理
                res.redirect("/login?lang=" + lang);
            }
        });
    });

    //修改session数据
    function modifySessionData(req, data) {
        var userData = UserDto.toSessionData(req, data);
        req.session["_USER_TOKEN_"] = userData["_USER_TOKEN_"];
        req.session.clientInfo = userData.clientInfo;
        req.session.user = userData.user;
    }
};

//获取验证码
exports.getLoginCaptcha = function (req, res) {
    var username = req.query.username || '';
    username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    if (!username) {
        res.status(400).send("need username parameter");
        return;
    }
    if (appToken) {
        getCaptchaByAppToken(appToken);
    } else {
        //获取验证码之前先获取所需AppToken
        getAppToken(req, res, getCaptchaByAppToken, function (errorObj) {
            res.status(500).json(errorObj);
        });
    }
    //根据appToken获取验证码
    function getCaptchaByAppToken(appToken) {
        DesktopLoginService.getLoginCaptcha(req, res, username, appToken).on("success", function (data) {
            res.status(200).json(data ? data.data : "");
        }).on("error", function (errorObj) {
            let loginLang = req.session ? req.session.lang : "";
            if (errorObj && (errorObj.message == CommonErrorCodeMap.getConfigJson(loginLang)[EXPIRE_TOKEN_CODE].message
                || errorObj.message == CommonErrorCodeMap.getConfigJson(loginLang)[INVALID_TOKEN_CODE].message)) {
                //应用token过期后，需重新获取应用token
                getAppToken(req, res, getCaptchaByAppToken, function (errorObj) {
                    res.status(500).json(errorObj);
                });
            } else {
                res.status(500).json(errorObj);
            }
        });
    }
};

//刷新验证码
exports.refreshCaptcha = function (req, res) {
    var username = req.query.username || '';
    username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    if (!username) {
        res.status(400).send("need username parameter");
        return;
    }
    if (appToken) {
        refreshLoginCaptcha(req, res, appToken);
    } else {
        //获取验证码之前先获取所需AppToken
        getAppToken(req, res, refreshLoginCaptcha, function (errorObj) {
            res.status(500).json(errorObj);
        });
    }
    //根据appToken刷新验证码
    function refreshLoginCaptcha(req, res, appToken) {
        DesktopLoginService.refreshLoginCaptcha(req, res, username, appToken).on("success", function (data) {
            res.status(200).json(data ? data.data : "");
        }).on("error", function (errorObj) {
            let loginLang = req.session ? req.session.lang : "";
            if (errorObj && (errorObj.message == CommonErrorCodeMap.getConfigJson(loginLang)[EXPIRE_TOKEN_CODE].message
                || errorObj.message == CommonErrorCodeMap.getConfigJson(loginLang)[INVALID_TOKEN_CODE].message)) {
                //应用token过期后，需重新获取应用token
                getAppToken(req, res, refreshLoginCaptcha, function (errorObj) {
                    res.status(500).json(errorObj);
                });
            } else {
                res.status(500).json(errorObj);
            }
        });
    }
};
