/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';
//var JSX = require('node-jsx').install({ extension: '.jsx' });
require('babel-core/register');
var DesktopLoginService = require('../service/desktop-login-service');
var UserDto = require('../../../lib/utils/user-dto');
let BackendIntl = require('../../../../portal/lib/utils/backend_intl');
const Promise = require('bluebird');
const commonUtil = require('../../../lib/utils/common-utils');
let restLogger = require('../../../lib/utils/logger').getLogger('rest');
let appUtils = require('../util/appUtils');
let WXBizDataCrypt = require('../lib/WXBizDataCrypt');
const _ = require('lodash');
//登录后绑定微信的标识
const bindWechatAfterLoginKey = 'isOnlyBindWechat';
// 公司和备案号信息
function getCompanyRecordNum(isCurtao, backendIntl){
    // curtao域名下的信息
    let obj = {
        company: backendIntl.get('company.name.curtao', '客套智能科技'),
        // 官网的链接
        companyLink: 'https://www.curtao.com/',
        // 备案号
        recordNum: '鲁ICP备18038856号'
    };
    //eefung域名下的信息
    if(!isCurtao){
        obj.company = backendIntl.get('company.name.eefung', '蚁坊软件');
        obj.companyLink = 'https://www.eefung.com/';
        obj.recordNum = '湘ICP备14007253号-1';
    }
    return obj;
}
function renderUserAgreementPrivacyPolicy(req, res){
    return function(isUserAgreement){
        //优先使用环境变量中设置的语言
        const registerLang = global.config.lang || req.query.lang || '';
        //将当前的语言环境存入session中
        if (req.session) {
            req.session.lang = registerLang;
            req.session.save();
        }
        let custom_service_lang = registerLang || 'zh_CN';
        custom_service_lang = custom_service_lang === 'zh_CN' ? 'ZHCN' : 'EN';
        let isCurtao = commonUtil.method.isCurtao(req);
        const phone = '400-6978-520';
        let backendIntl = new BackendIntl(req);
        let companyInfo = getCompanyRecordNum(isCurtao, backendIntl);
        res.render('login/tpl/user-agreement', {
            isFormal: global.config.isFormal,
            isCurtao: isCurtao,
            siteID: global.config.siteID,
            lang: registerLang,
            ...companyInfo,
            hotline: backendIntl.get('companay.hotline', '服务热线: {phone}', {'phone': phone}),
            timeStamp: global.config.timeStamp,
            userid: '',
            contact: '',
            custom_service_lang,
            isUserAgreement
        });
    };
}
// 用户协议界面
exports.showUserAgreementPage = function(req, res){
    renderUserAgreementPrivacyPolicy(req, res)(true);
};
// 隐私政策
exports.showPrivacyPolicy = function(req, res){
    renderUserAgreementPrivacyPolicy(req, res)();
};


//注册界面
exports.showRegisterPage = function(req, res) {
    //优先使用环境变量中设置的语言
    const registerLang = global.config.lang || req.query.lang || '';
    //将当前的语言环境存入session中
    if (req.session) {
        req.session.lang = registerLang;
        req.session.save();
    }
    let custom_service_lang = registerLang || 'zh_CN';
    custom_service_lang = custom_service_lang === 'zh_CN' ? 'ZHCN' : 'EN';
    let isCurtao = commonUtil.method.isCurtao(req);
    const phone = '400-6978-520';
    let backendIntl = new BackendIntl(req);
    let companyInfo = getCompanyRecordNum(isCurtao, backendIntl);
    res.render('login/tpl/register', {
        isFormal: global.config.isFormal,
        isCurtao: isCurtao,
        siteID: global.config.siteID,
        lang: registerLang,
        ...companyInfo,
        hotline: backendIntl.get('companay.hotline', '服务热线: {phone}', {'phone': phone}),
        timeStamp: global.config.timeStamp,
        userid: '',
        contact: '',
        custom_service_lang
    });

};


/**
 * 首页
 * @param req
 * @param res
 */
//登录页、绑定微信
function showLoginOrBindWechatPage(req, res) {
    return function(isBindWechat) {
        var loginErrorMsg = req.session.loginErrorMsg;
        if (loginErrorMsg) {
            delete req.session.loginErrorMsg;
        }
        //用于记录微信注册新账号的错误，已便展示到注册新账号tab下
        let isWechatRegisterError = req.session.isWechatRegisterError;
        if (isWechatRegisterError) {
            delete req.session.isWechatRegisterError;
        }
        //从session中获取上一次登录用户名
        var last_login_user = req.session.last_login_user || '';
        var obj = {
            username: last_login_user,
            loginErrorMsg: loginErrorMsg,
            isWechatRegisterError: isWechatRegisterError,
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
            let isCurtao = commonUtil.method.isCurtao(req);
            const phone = '400-6978-520';
            const qq = '4006770986';
            let backendIntl = new BackendIntl(req);
            let hideLangQRcode = '';
            if (global.config.lang && global.config.lang === 'es_VE') {
                hideLangQRcode = 'true';
            }
            let custom_service_lang = loginLang || 'zh_CN';
            custom_service_lang = custom_service_lang === 'zh_CN' ? 'ZHCN' : 'EN';
            let companyInfo = getCompanyRecordNum(isCurtao, backendIntl);
            res.render('login/tpl/desktop-login', {
                loginErrorMsg: obj.loginErrorMsg,
                username: obj.username,
                captchaCode: obj.captchaCode || '',
                isFormal: global.config.isFormal,
                ...companyInfo,
                hotline: backendIntl.get('companay.hotline', '服务热线: {phone}', {'phone': phone}),
                // contact: backendIntl.get('company.qq', '企业QQ: {qq}', {'qq': qq}),
                contact: '',
                siteID: global.config.siteID,
                lang: loginLang,
                custom_service_lang: custom_service_lang,
                userid: obj.username,
                hideLangQRcode: hideLangQRcode,
                clientId: global.config.loginParams.clientId,
                stopcheck: stopcheck,
                useSso: global.config.useSso,
                isCurtao: isCurtao,
                timeStamp: global.config.timeStamp,
                isBindWechat: isBindWechat,//是否是绑定微信的界面
                isWechatRegisterError: obj.isWechatRegisterError,//是否是微信注册新账号界面报的错
                ssoUrl: global.config.ssoUrl,
            });
        }
    };
}
//登录页的展示
exports.showLoginPage = function(req, res) {
    showLoginOrBindWechatPage(req, res)();
};
//绑定微信的页面展示
exports.showWechatBindPage = function(req, res) {
    showLoginOrBindWechatPage(req, res)(true);
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
    console.time('登录相关接口============================');
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
            //登录成功后获取网站个性化配置:是否是首次登录，来控制是否展示欢迎页
            DesktopLoginService.getWebsiteConfig(req, res).on('success', data => {
                console.timeEnd('登录相关接口============================');
                // 记录网站的个性化配置数据，获取用户信息时，不用再发请求获取一遍
                req.session.websiteConfig = data || {};
                //获取网站个性化配置,以便判断进入后的首页是否展示欢迎页
                let personnel_setting = _.get(data, 'personnel_setting');
                if(!_.get(personnel_setting, commonUtil.CONSTS.WELCOME_PAGE_FIELD)) {
                    req.session.showWelComePage = true;
                }
                req.session.save(() => {
                    //ajax请求返回sussess
                    if (req.xhr) {
                        //session失效时，登录成功后的处理
                        res.status(200).json('success');
                    } else {
                        //登录界面，登录成功后的处理
                        res.redirect('/');
                    }
                });
            }).on('error', errorObj => {
                // 获取组织失败后的处理
                req.session.user = '';
                loginError(req, res)(errorObj);
                /*if (req.xhr) {
                    //session失效时，登录成功后的处理
                    res.status(200).json('success');
                } else {
                    //登录界面，登录成功后的处理
                    res.redirect('/login?lang=' + lang);
                }*/
            });
        });
    };
}

//登录失败处理
function loginError(req, res) {
    return function(data) {
        let lang = req.session && req.session.lang || 'zh_CN';
        req.session.stopcheck = 'true';
        let backendIntl = new BackendIntl(req);
        //ajax方式请求的时候，不需要缓存错误信息
        if(!req.xhr) {
            if (data && data.message) {
                req.session.loginErrorMsg = data.message;
            } else {
                req.session.loginErrorMsg = backendIntl.get('login.username.password.error', '用户名或密码错误');
            }
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
        req.session.save(() => {
            res.status(200).json(data ? data.data : '');
        });
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};
//获取session中的用户信息
exports.getSessionUserData = function(req, res){
    res.status(200).json(_.get(req,'session.user',{}));
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
            if (!data) data = true;
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
    DesktopLoginService.getTicket(req, res).on('success', function(data) {
        if (!data) data = '';
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//重置密码
exports.resetPassword = function(req, res) {
    DesktopLoginService.resetPassword(req, res).on('success', function(data) {
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
 * 微信小程序登录逻辑
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
        .on('error', function(errorObj) {
            res.status(500).json(errorObj && errorObj.message);
        });
};
/*
* chrome扩展插件登录*/
exports.extensionLogin = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var captcha = req.body.retcode;
    DesktopLoginService.login(req, res, username, password, captcha)
        .on('success', extensionLoginSuccess(req, res))
        .on('error', function(errorObj) {
            res.status(500).json(errorObj && errorObj.message);
        });
};
function extensionLoginSuccess(req, res){
    req.session.stopcheck = '';
    return function(data) {
        //修改session数据
        modifySessionData(req, data);
        //设置sessionStore，如果是内存session时，需要从req中获取
        global.config.sessionStore = global.config.sessionStore || req.sessionStore;
        req.session.save(function() {
            //登录成功后获取用户的组织信息，（主页的matomo数据参数设置中需要放入组织信息）
            DesktopLoginService.getOrganization(req, res).on('success', data => {
                // 组织信息中名称和id字段转为name和id字段，方便前端处理（若后端更改字段名时）
                let userData = _.get(req, 'session.user', {});
                userData.organization = {
                    id: _.get(data,'id', ''),
                    officialName: _.get(data, 'official_name', ''),
                    functions: _.get(data, 'functions', []),
                    type: _.get(data, 'type', ''),
                    version: _.get(data, 'version', {})
                };
                req.session.save(() => {
                    //session失效时，登录成功后的处理
                    res.status(200).json(userData);
                });
            }).on('error', errorObj => {
                // 获取组织失败后的处理
                req.session.user = '';
                res.status(500).json('error');
            });
        });
    };
}

//获取组织信息
exports.getOrganization = function(req, res) {
    DesktopLoginService.getOrganization(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};
// 检查电话是否已经被注册过
exports.checkPhoneIsRegisted = function(req, res) {
    DesktopLoginService.checkPhoneIsRegisted(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};
//获取短信验证码
exports.getVertificationCode = function(req, res) {
    DesktopLoginService.getVertificationCode(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};
//注册个人账号
exports.registerAccount = function(req, res) {
    DesktopLoginService.registerAccount(req, res).on('success', function(data) {
        if (data) {//注册成功后自动登录
            var username = req.body.phone;
            var password = req.body.pwd;
            //记录上一次登录用户名，到session中
            username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
            req.session.last_login_user = username;
            DesktopLoginService.login(req, res, username, password)
                .on('success', loginSuccess(req, res))
                .on('error', function(errorObj) {
                    res.status(500).json(errorObj && errorObj.message);
                });
        } else {
            res.status(200).json(data);
        }
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};
//短信验证码的验证
exports.validatePhoneCode = function(req, res) {
    DesktopLoginService.validatePhoneCode(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//注册，短信验证码验证失败三次后获取图片验证码
exports.getRegisterCaptchaCode = function(req, res) {
    DesktopLoginService.getRegisterCaptchaCode(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
};

//web点击微信登录时（登录后绑定微信时），二维码页面的展示
exports.wechatLoginPage = function(req, res) {
    let stateData = req.sessionID;
    //登录后绑定微信
    if (req.query.isBindWechatAfterLogin) {
        stateData += bindWechatAfterLoginKey;
    }
    let qrconnecturl = 'https://open.weixin.qq.com/connect/qrconnect?appid=wxf169b2a9aa1958a9'
        + '&redirect_uri=' + encodeURIComponent('https://ketao.antfact.com/wechat/login_bind/code')
        + '&response_type=code&scope=snsapi_login&state=' + stateData;
    res.redirect(qrconnecturl);
    // DesktopLoginService.wechatLoginPage(req, res).on('success', function(data) {
    //     restLogger.info('微信登录跳转数据：' + JSON.stringify(data));
    //     res.send(data);
    // }).on('error', function(errorObj) {
    //     res.status(500).send(errorObj && errorObj.message);
    // });
};
//web端微信扫描二维码后，微信登录或绑定的处理
exports.wechatLoginBindByCode = function(req, res) {
    // restLogger.info('绑定微信================================' + JSON.stringify(req.query));
    let code = '', isBindWechatAfterLogin = false;
    if (req.query && req.query.code) {
        let sessionId = req.query.state;
        //是否是登录后绑定的处理
        if (sessionId && sessionId.indexOf(bindWechatAfterLoginKey) !== -1) {
            isBindWechatAfterLogin = true;
            sessionId = sessionId.split(bindWechatAfterLoginKey)[0];
        }
        if (req.sessionID === sessionId) {
            code = req.query.code;
        }
        // restLogger.info('绑定微信' + req.sessionID + '===========' + sessionId);
    }
    // restLogger.info('绑定微信code==============' + code);
    // restLogger.info('绑定微信isBindWechatAfterLogin==============' + isBindWechatAfterLogin);
    let backendIntl = new BackendIntl(req);
    //通过扫描的二维码获取unionId
    if (code) {
        DesktopLoginService.loginWithWechat(req, res, code).on('success', function(data) {
            // restLogger.info('微信unionId的获取======================：' + JSON.stringify(data));
            let unionId = _.get(data, 'unionid');
            //获取到unionId后，通过unionId检查微信是否绑定
            if (unionId) {
                //个人资料绑定微信的处理
                if (isBindWechatAfterLogin) {
                    DesktopLoginService.bindWechat(req, res, unionId)
                        .on('success', function(result) {
                            //绑定成功,个人资料界面
                            res.redirect('user-preference');
                        }).on('error', function(errorObj) {
                        //绑定失败后，也跳到个人资料界面
                            res.redirect('/user-preference?bind_error=true');
                        });
                } else {//点微信登录的处理
                    checkWechatIsBind(req, res, unionId);
                }
            } else {
                // restLogger.error('微信扫码后，unionId不存在');
                loginWithWechatError(req, res, isBindWechatAfterLogin)({message: backendIntl.get('login.wechat.login.error', '微信登录失败')});
            }
        }).on('error', loginWithWechatError(req, res, isBindWechatAfterLogin));
    } else {
        // restLogger.error('微信扫码后，code不存在');
        loginWithWechatError(req, res, isBindWechatAfterLogin)({message: backendIntl.get('login.wechat.login.error', '微信登录失败')});
    }
};

//微信扫码后的错误处理
function loginWithWechatError(req, res, isBindWechatAfterLogin) {
    return function(errorObj) {
        //个人资料绑定微信的处理
        if (isBindWechatAfterLogin) {
            res.redirect('/user-preference?bind_error=true');
        } else {
            loginError(req, res)(errorObj);
        }
    };
}
//小程序微信登录
exports.loginWithWechatMiniprogram = function(req, res) {
    let code = '';
    let encryptedData = '';
    let iv = '';
    if (req.query) {
        code = req.query.code || '';
        encryptedData = req.query.encryptedData || '';
        iv = req.query.iv || '';
    }
    if (code) {
        DesktopLoginService.loginWithWechatMiniprogram(req, res, code).on('success', function(result) {
            // restLogger.info('小程序微信登录:' + JSON.stringify(result));
            let sessionKey = result.session_key;
            try {
                let pc = new WXBizDataCrypt(appUtils.MINI_PROGRAM_APPID, sessionKey);
                let data = pc.decryptData(encryptedData, iv);
                // restLogger.info('小程序获取unionId:' + JSON.stringify(data));
                let unionId = _.get(data, 'unionId');
                if (unionId) {
                    checkWechatIsBindMiniprogram(req, res, unionId);
                } else {
                    res.status(500).json('微信登录失败');
                    // restLogger.error('小程序微信登录，unionId不存在');
                }
            } catch (e) {//捕获pc.decryptData()方法中的'Illegal Buffer'异常
                res.status(500).json('微信登录失败');
                // restLogger.error('小程序微信登录，处理unionId时，报 Illegal Buffer 错误');
            }
        }).on('error', function(errorObj) {
            res.status(500).json(errorObj && errorObj.message);
        });
    } else {
        res.status(500).json('微信登录失败');
        // restLogger.error('小程序微信登录，code不存在');
    }
};
//web用已有账号绑定微信并登录
exports.bindLoginWechat = function(req, res) {
    let unionId = req.session.union_id;
    if (unionId) {
        var username = req.body.username;
        var password = req.body.password;
        var captcha = req.body.retcode;
        //记录上一次登录用户名，到session中
        username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
        DesktopLoginService.login(req, res, username, password, captcha)
            .on('success', function(data) {
                modifySessionData(req, data);
                //设置sessionStore，如果是内存session时，需要从req中获取
                global.config.sessionStore = global.config.sessionStore || req.sessionStore;
                req.session.save(function() {
                    DesktopLoginService.bindWechat(req, res, unionId)
                        .on('success', function(result) {
                            //绑定成功
                            loginSuccess(req, res)(data);
                        }).on('error', wechatBindRegisterLoginError(req, res));
                });
            }).on('error', wechatBindRegisterLoginError(req, res));
    } else {
        let backendIntl = new BackendIntl(req);
        wechatBindRegisterLoginError(req, res)({message: backendIntl.get('login.wechat.bind.error', '微信绑定失败')});
        // restLogger.error('web微信绑定已有账号登录未取到union_id');
    }
};
//微信小程序用已有账号绑定微信并登录
exports.bindLoginWechatMiniprogram = function(req, res) {
    let unionId = req.session.union_id;
    if (unionId) {
        // restLogger.info('小程序绑定登录unionId：' + unionId);
        // restLogger.info('小程序绑定登录body：' + JSON.stringify(req.body));
        var username = req.body.username;
        var password = req.body.password;
        //记录上一次登录用户名，到session中
        username = username.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
        DesktopLoginService.login(req, res, username, password)
            .on('success', function(data) {
                // restLogger.info('小程序绑定已有用户，登录成功');
                modifySessionData(req, data);
                //设置sessionStore，如果是内存session时，需要从req中获取
                global.config.sessionStore = global.config.sessionStore || req.sessionStore;
                req.session.save(function() {
                    // restLogger.info('小程序绑定已有用户，user_token已存到session中，发绑定的请求');
                    DesktopLoginService.bindWechat(req, res, unionId).on('success', function(result) {
                        //绑定成功后将登录后的数据返回到小程序
                        wechatLoginSuccess(req, res)(data);
                    }).on('error', function(errorObj) {
                        res.status(500).json(errorObj && errorObj.message);
                    });
                });
            }).on('error', function(errorObj) {
                res.status(500).json(errorObj && errorObj.message);
            });
    } else {
        res.status(500).json('微信绑定失败');
        // restLogger.error('小程序绑定已有账号，unionId不存在');
    }
};
//web注册新账号绑定微信并登录
exports.registerLoginWechat = function(req, res) {
    let unionId = req.session.union_id;
    if (unionId) {
        DesktopLoginService.registBindWechatLogin(req, res, {user_name: req.body.username, union_id: unionId})
            .on('success', loginSuccess(req, res))
            .on('error', function(errorObj) {
                //用于记录微信注册新账号的错误，已便展示到注册新账号tab下
                req.session.isWechatRegisterError = true;
                wechatBindRegisterLoginError(req, res)(errorObj, true);
            });
    } else {
        //用于记录微信注册新账号的错误，已便展示到注册新账号tab下
        req.session.isWechatRegisterError = true;
        let backendIntl = new BackendIntl(req);
        wechatBindRegisterLoginError(req, res)({message: backendIntl.get('register.error.tip', '注册失败')}, true);
        // restLogger.error('web微信注册登录未取到union_id');
    }
};
//微信小程序注册新账号绑定微信并登录
exports.registerLoginWechatMiniprogram = function(req, res) {
    let unionId = req.session.union_id;
    if (unionId) {
        // restLogger.info('小程序注册登录unionId：' + unionId);
        // restLogger.info('小程序注册登录body：' + JSON.stringify(req.body));
        DesktopLoginService.registBindWechatLogin(req, res, {user_name: req.body.user_name, union_id: unionId})
            .on('success', wechatLoginSuccess(req, res))
            .on('error', function(errorObj) {
                res.status(500).json(errorObj && errorObj.message);
            });
    } else {
        res.status(500).json('注册登录失败');
        // restLogger.error('小程序注册登录未取到union_id');
    }
};

//登录后判断该用户是否已绑定微信
exports.checkLoginWechatIsBind = function(req, res) {
    DesktopLoginService.checkLoginWechatIsBind(req, res)
        .on('success', function(data) {
            //如果已绑定的话就会返回{id,user_id,open_id,platform,create_date: "2018-11-21T06:31:27.555Z"}
            if (data) {
                res.status(200).json(true);
            } else {//未绑定的话会auth2返回204状态码没有返回数据
                res.status(200).json(false);
            }
        }).on('error', function(errorObj) {
            res.status(500).json(errorObj && errorObj.message);
        });
};

//解绑微信
exports.unbindWechat = function(req, res) {
    DesktopLoginService.unbindWechat(req, res)
        .on('success', function(data) {
            res.status(200).json(true);
        }).on('error', function(errorObj) {
            res.status(500).json(errorObj && errorObj.message);
        });
};

//web检查微信是否已绑定客套账号
function checkWechatIsBind(req, res, unionId) {
    DesktopLoginService.checkWechatIsBind(req, res, unionId).on('success', function(data) {
        // restLogger.info('微信是否绑定：' + JSON.stringify(data));
        let isBind = _.get(data, 'result');
        //已绑定
        if (isBind) {
            wechatLoginByUnionId(req, res, unionId);
        } else {//未绑定
            //将unionId存入session中，下面绑定微信账号时会用到
            req.session.union_id = unionId;
            req.session.save(function() {
                //未绑定的账号跳转到绑定账号的界面
                res.redirect('/wechat_bind');
            });
        }
    }).on('error', loginError(req, res));
}
//小程序检查微信是否已绑定客套账号
function checkWechatIsBindMiniprogram(req, res, unionId) {
    DesktopLoginService.checkWechatIsBind(req, res, unionId).on('success', function(data) {
        // restLogger.info('微信是否绑定：' + JSON.stringify(data));
        let isBind = _.get(data, 'result');
        //已绑定
        if (isBind) {
            // restLogger.info('微信已绑定继续登录');
            wechatLoginByUnionIdMiniprogram(req, res, unionId);
        } else {//未绑定
            //将unionId存入session中，下面绑定微信账号时会用到
            req.session.union_id = unionId;
            req.session.save(function() {
                // restLogger.info('微信未绑定');
                res.status(200).json(false);
            });
        }
    }).on('error', function(errorObj) {
        res.status(500).json(errorObj && errorObj.message);
    });
}

//web通过微信的unionId登录
function wechatLoginByUnionId(req, res, unionId) {
    DesktopLoginService.wechatLoginByUnionId(req, res, unionId)
        .on('success', loginSuccess(req, res))
        .on('error', loginError(req, res));
}

//小程序通过微信的unionId登录
function wechatLoginByUnionIdMiniprogram(req, res, unionId) {
    DesktopLoginService.wechatLoginByUnionId(req, res, unionId)
        .on('success', wechatLoginSuccess(req, res))
        .on('error', function(errorObj) {
            res.status(500).json(errorObj && errorObj.message);
        });
}

//修改session数据
function modifySessionData(req, data) {
    var userData = UserDto.toSessionData(req, data);
    req.session['_USER_TOKEN_'] = userData['_USER_TOKEN_'];
    req.session.clientInfo = userData.clientInfo;
    req.session.user = userData.user;
}

//微信登录及微信小程序账号、密码登录成功处理
function wechatLoginSuccess(req, res) {
    return function(data) {
        //修改session数据
        modifySessionData(req, data);
        //设置sessionStore，如果是内存session时，需要从req中获取
        global.config.sessionStore = global.config.sessionStore || req.sessionStore;
        req.session.save(function() {
            if (data) {
                var result = {
                    'nick_name': data.nick_name,
                    'privileges': data.privileges,
                    'user_id': data.user_id,
                    'user_name': data.user_name
                };
                //登录成功后的处理
                res.status(200).json(result);
            } else {
                res.status(500).json('登录失败');
                // restLogger.error('小程序登录后，返回数据为空');
            }
        });
    };
}

//web微信绑定(注册)登录失败的处理
function wechatBindRegisterLoginError(req, res) {
    return function(data, isRegister) {
        // restLogger.info('微信号注册登录失败：' + JSON.stringify(data));
        let backendIntl = new BackendIntl(req);
        let defaultErrorMsg = isRegister ? backendIntl.get('login.wechat.register.login.error', '微信号注册登录失败') :
            backendIntl.get('login.wechat.bind.error', '微信绑定失败');
        //ajax方式请求的时候，不需要缓存错误信息
        if (!req.xhr) {
            if (data && data.message) {
                req.session.loginErrorMsg = data.message;
            } else {
                req.session.loginErrorMsg = defaultErrorMsg;
            }
        }
        req.session.save(function() {
            if (req.xhr) {
                //session失效时，登录失败后的处理
                res.status(500).json(data && data.message || defaultErrorMsg);
            } else {
                //绑定（注册）登录界面，登录失败的处理
                let lang = req.session && req.session.lang || 'zh_CN';
                res.redirect('/wechat_bind?lang=' + lang);
            }
        });
    };
}

