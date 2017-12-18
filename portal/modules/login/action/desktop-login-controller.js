/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
//var JSX = require('node-jsx').install({ extension: '.jsx' });
require('babel-core/register');
var React = require("react");
var ReactDOMServer = require('react-dom/server');
global.__STYLE_COLLECTOR_MODULES__ = [];
global.__STYLE_COLLECTOR__ = "";
var LoginForm = React.createFactory(require('../../../../dist/server-render/login'));
var DesktopLoginService = require("../service/desktop-login-service");
var UserDto = require("../../../lib/utils/user-dto");
var CommonErrorCodeMap = require("../../../../conf/errorCode/CommonErrorCode");
var appToken = "";//应用token，获取一次后，保存起来
let BackendIntl = require("../../../../portal/lib/utils/backend_intl");
const Promise = require("bluebird");

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
function getAppToken(req, res) {
    return new Promise(function(resolve, reject) {
        DesktopLoginService.getAppToken(req, res).on("success", function (data) {
            appToken = data && data.access_token ? data.access_token : "";
            resolve(appToken);
        }).on("error", function (errorObj) {
            reject(errorObj);
        });
    });
}

/**
 * 首页
 * @param req
 * @param res
 */

exports.showLoginPage = function (req, res) {
    var loginErrorMsg = req.session.loginErrorMsg;
    if (loginErrorMsg) {
        delete req.session.loginErrorMsg;
    }
    //从session中获取上一次登录用户名
    var last_login_user = req.session.last_login_user || '';
    var obj = {
        username: last_login_user
    };
    //优先使用环境变量中设置的语言
    const loginLang = global.config.lang || req.query.lang || "";
    const stopcheck = req.session.stopcheck;
    //将当前的语言环境存入session中
    if (req.session) {
        req.session.lang = loginLang;
        req.session.save();
    }
    function renderHtml() {
        var styleContent = global.__STYLE_COLLECTOR__;
        var formHtml = ReactDOMServer.renderToString(LoginForm(obj));
        var phone = '400-677-0986';
        var qq = '4006770986';
        let backendIntl = new BackendIntl(req);
        let hideLangQRcode = '';
        if (global.config.lang && global.config.lang == "es_VE") {
            hideLangQRcode = 'true';
        }
        res.render('login/tpl/desktop-login', {
            styleContent: styleContent,
            loginForm: formHtml,
            loginErrorMsg: loginErrorMsg,
            username: obj.username,
            captchaCode: obj.captchaCode || "",
            addShowingIoCode: global.config.formal,
            company: backendIntl.get("company.name", "© 蚁坊软件 湘ICP备14007253号-1"),
            hotline: backendIntl.get("companay.hotline", "服务热线: {phone}", {'phone': phone}),
            contact: backendIntl.get("company.qq", "企业QQ: {qq}", {'qq': qq}),
            siteID: global.config.siteID,
            lang: loginLang,
            hideLangQRcode: hideLangQRcode,
            projectName: global.config.processTitle || "oplate",
            clientId: global.config.loginParams.clientId,
            stopcheck: stopcheck
        });
    }

    renderHtml();
};
/*
 * 登录逻辑
 */
exports.ssologin = function (req, res) {
    var ticket = req.query.t;
    if (!ticket) {
        req.session.stopcheck = "true";
        let lang = req.session && req.session.lang || "zh_CN";
        //登录界面，登录失败的处理
        res.redirect("/login?lang=" + lang);
    }else{
        DesktopLoginService.loginWithTicket(req, res, ticket)
            .on("success", loginSuccess(req, res))
            .on("error", loginError(req, res));
    }
};

//修改session数据
function modifySessionData(req, data) {
    var userData = UserDto.toSessionData(req, data);
    req.session["_USER_TOKEN_"] = userData["_USER_TOKEN_"];
    req.session.clientInfo = userData.clientInfo;
    req.session.user = userData.user;
};

//登录成功处理
function loginSuccess(req, res) {
    req.session.stopcheck = "";
    return function (data) {
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
    }
}
//登录失败处理
function loginError(req, res) {
    return function (data) {
        let lang = req.session && req.session.lang || "zh_CN";
        req.session.stopcheck = "true";
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
    }
}

//获取验证码
exports.getLoginCaptcha = function (req, res) {
    var type = req.query.type;
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
        DesktopLoginService.getLoginCaptcha(req, res, username, appToken, type).on("success", function (data) {
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
    var type = req.query.type;
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
        DesktopLoginService.refreshLoginCaptcha(req, res, username, appToken, type).on("success", function (data) {
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

//检查联系方式是否存在
exports.checkContactInfoExists = function (req, res) {
    getAppToken(req, res).then(function (appToken) {
        DesktopLoginService.checkContactInfoExists(req, res, appToken).on("success", function (data) {
            if (!data) data = "";

            res.status(200).json(data);
        }).on("error", function (errorObj) {
            res.status(500).json(errorObj);
        });
    }, function (errorObj) {
        res.status(500).json(errorObj);
    });
};

//获取操作码
function getOperateCode(req, res) {
    return new Promise(function(resolve, reject) {
        const user_name = req.query.user_name;
        const captcha = req.query.captcha;

        getAppToken(req, res).then(function (appToken) {
            DesktopLoginService.getOperateCode(req, res, appToken, user_name, captcha).on("success", function (data) {
                const operateCode = data && data.operate_code;

                resolve(operateCode);
            }).on("error", function (errorObj) {
                reject(errorObj);
            });
        }, function (errorObj) {
            reject(errorObj);
        });
    });
};

//发送重置密码时的身份验证信息
exports.sendResetPasswordMsg = function (req, res) {
    const arrayOfPromises = [
        //获取操作码
        getOperateCode(req, res),
        //获取应用Token
        getAppToken(req, res)
    ];

    Promise.all(arrayOfPromises)
    .then(function(results) {
        const operateCode = results[0];
        const appToken = results[1];
        const userName = req.query.user_name;
        const sendType = req.query.send_type;

        //发送信息
        DesktopLoginService.sendResetPasswordMsg(req, res, appToken, userName, sendType, operateCode).on("success", function (data) {
            if (!data) data = "";

            res.status(200).json(data);
        }).on("error", function (errorObj) {
            res.status(500).json(errorObj);
        });
    })
    .catch(function (errorObj) {
        res.status(500).json(errorObj);
    });
};

//获取凭证
exports.getTicket = function (req, res) {
    getAppToken(req, res).then(function (appToken) {
        const user_id = req.query.user_id;
        const code = req.query.code;

        DesktopLoginService.getTicket(req, res, appToken, user_id, code).on("success", function (data) {
            if (!data) data = "";

            res.status(200).json(data);
        }).on("error", function (errorObj) {
            res.status(500).json(errorObj);
        });
    }, function (errorObj) {
        res.status(500).json(errorObj);
    });
};

//重置密码
exports.resetPassword = function (req, res) {
    getAppToken(req, res).then(function (appToken) {
        const user_id = req.query.user_id;
        const ticket = req.query.ticket;
        const new_password = req.query.new_password;

        DesktopLoginService.resetPassword(req, res, appToken, user_id, ticket, new_password).on("success", function (data) {
            if (!data) data = "";

            res.status(200).json(data);
        }).on("error", function (errorObj) {
            res.status(500).json(errorObj);
        });
    }, function (errorObj) {
        res.status(500).json(errorObj);
    });
};

