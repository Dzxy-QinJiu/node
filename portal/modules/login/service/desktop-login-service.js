var restLogger = require('../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var config = require('../../../../conf/config');
//后端国际化
let BackendIntl = require('../../../lib/utils/backend_intl');
const ipUtil = require('../../../lib/utils/common-utils').ip;
let appUtils = require('../util/appUtils');

//定义url
var urls = {
    //登录
    login: '/rest/open/resource/member/login',//登录改用业务接口，不再直接调用auth2的接口'/auth2/authc/login',因为客套个人注册的账号到期只是组织到期，账号本身还可以登录auth2，但组织信息获取不到，导致到期的账号登录后会被踢出的问题,调业务的接口会先检查组织到没到期，到期后直接不让登录
    //获取验证码
    getLoginCaptcha: '/auth2/authc/captcha/get',
    //刷新验证码
    refreshLoginCaptcha: '/auth2/authc/captcha/refresh',
    //获取重置密码验证码
    getResetPasswordCaptcha: '/auth2/authc/reset_password/captcha',
    //检查联系方式是否存在
    checkContactInfoExists: '/auth2/rs/users/',
    //获取操作码
    getOperateCode: '/auth2/authc/reset_password/getPhoneAndEmail',
    //发送验证信息
    sendResetPasswordMsg: '/auth2/authc/reset_password/send_msg',
    //通过验证码换取临时票据
    getTicket: '/auth2/authc/reset_password/ticket',
    //重置密码
    resetPassword: '/auth2/authc/reset_password/update',
    //根据ticket登录
    loginWithTicket: '/auth2/authc/third_login/login',
    //获取扫码登录的二维码
    getLoginQRCode: '/auth2/authc/scan_code/screen_code',
    //通过扫码登录
    loginByQRCode: '/auth2/authc/scan_code/login',
    //根据公司标识获取公司
    getCompanyByName: '/rest/open/resource/organization',
    //检查手机号是否被注册过
    checkPhoneIsRegisted: '/rest/open/resource/invite/check',
    //获取短信验证码
    getVertificationCode: '/rest/open/resource/verificationcode',
    //注册个人账号
    registerAccount: '/rest/open/resource/organization/personal',
    //短信验证码的验证
    validatePhoneCode: '/rest/open/resource/verificationcode/check',
    //注册，短信验证码验证失败三次后获取图片验证码
    getRegisterCaptchaCode: '/rest/open/resource/verificationcode/check/captcha',
    //检查微信是否已绑定客套账号
    checkWechatIsBindUrl: '/auth2/authc/social/check',
    //通过微信的unionId登录
    wechatLoginByUnionIdUrl: '/auth2/authc/social/login',
    //注册新用户绑定微信号并登录
    registBindWechatLoginUrl: '/auth2/authc/social/register',
    //已有用户绑定微信账号
    bindWechatUrl: '/auth2/rs/self/social/binding',
    //解绑微信
    unbindWechatUrl: '/auth2/rs/self/social/unbind',
    //登录后判断是否绑定微信
    checkLoginWechatIsBindUrl: '/auth2/rs/self/social?platform=wechat',
    //获取登录用户的组织信息
    getOrganization: '/rest/base/v1/user/member/organization'
};
//验证码的高和宽
var captcha = {
    width: 400,
    height: 152
};

//导出url
exports.urls = urls;

/**
 * 调用后端接口进行登录
 */
exports.login = function(req, res, username, password, captchaCode) {
    var formData = getLoginFormData(username, password, captchaCode);
    return restUtil.baseRest.post(
        {
            url: urls.login,
            req: req,
            res: res,
            headers: {
                session_id: req.sessionID
            },
            //后端要求用form的post提交
            form: formData
        }, null, {
            success: loginSuccess.bind(req),
            timeout: loginTimeout
        });
};
/*
 根据ticket登录
 */
exports.loginWithTicket = function(req, res, ticket) {
    return restUtil.appAuthRest.post({
        url: urls.loginWithTicket,
        req: req,
        res: res,
        form: {
            ticket: ticket
        }
    }, null, {
        success: loginSuccess.bind(req),
        timeout: loginTimeout
    });
};

/**
 * 登录超时处理
 */
function loginTimeout(emitter, data) {
    if (emitter) {
        emitter.emit('error', data);
    }
}

/*
 登录成功处理
 */
function loginSuccess(emitter, data, req) {
    if (emitter) {
        //如果未返回数据
        if (!data) {
            let backendIntl = new BackendIntl(req);
            emitter.emit('error', backendIntl.get('login.service.error', '很抱歉,服务器出现了异常状况'));
        } else {
            emitter.emit('success', getLoginResult(data));
        }
    }
}

//处理返回用户信息
function getLoginResult(data) {
    //前端登录后所需数据结构
    var loginResult = {
        auth: {
            client_id: 'other',
            realm_id: '',
            access_token: '',
            refresh_token: ''
        },
        nick_name: '',
        privileges: [],
        user_id: '',
        user_name: '',
        role_infos: [],
    };
    if (data.token) {
        loginResult.auth.access_token = data.token.access_token || '';
        loginResult.auth.refresh_token = data.token.refresh_token || '';
    }
    var userData = data.user;
    if (userData) {
        //realm_id
        loginResult.auth.realm_id = userData.realm_id;//如果managed_realms不存在（curtao会不存在），就用realm_id
        // managed_realms已不存在，先注释掉，已备之后再用
        // if (userData.managed_realms && userData.managed_realms.length > 0) {
        //     loginResult.auth.realm_id = userData.managed_realms[0];
        // }
        var userClients = userData.user_client;
        if (userClients && userClients.length > 0) {
            var userClient = userClients[0];
            if (userClient) {
                //privileges
                var permissions = userClient.permission_infos || [];
                if (permissions && permissions.length > 0) {
                    loginResult.privileges = permissions.map(function(permission) {
                        return permission.permission_define;
                    });
                }
                //role_infos
                let roleInfos = userClient.role_infos || [];
                if (roleInfos && roleInfos.length) {
                    loginResult.role_infos = userClient.role_infos.map(role => {
                        return {role_id: role.role_id, role_name: role.role_name};
                    });
                }
            }
        }
        loginResult.nick_name = userData.nick_name;
        loginResult.user_id = userData.user_id;
        loginResult.user_name = userData.user_name;
    }
    return loginResult;
}

/**
 * 获取验证码
 * @param req
 * @param res
 * @param user_name
 * @param type  区分是登录验证码还是找回密码验证码
 */
exports.getLoginCaptcha = function(req, res, user_name, type) {
    var url = urls.getLoginCaptcha;
    var headers = {
        session_id: req.sessionID
    };
    if (type) {
        url = urls.getResetPasswordCaptcha;
    }
    return restUtil.appAuthRest.get(
        {
            url: url,
            req: req,
            res: res,
            headers: headers
        }, {
            user_name: user_name,
            width: captcha.width,
            height: captcha.height
        });
};

/**
 * 刷新验证码
 *
 */
exports.refreshLoginCaptcha = function(req, res, user_name, type) {
    var url = urls.refreshLoginCaptcha;
    var headers = {
        session_id: req.sessionID
    };

    if (type) {
        url = urls.getResetPasswordCaptcha;
    }

    return restUtil.appAuthRest.get(
        {
            url: url,
            req: req,
            res: res,
            headers: headers
        }, {
            user_name: user_name,
            width: captcha.width,
            height: captcha.height
        });
};

//获取登录时的formData
function getLoginFormData(username, password, captchaCode) {
    var formData = {
        client_id: config.loginParams.clientId,//oplate应用的Id
        client_secret: config.loginParams.clientSecret,//oplate应用秘钥
        user_name: username,
        password: password
    };
    if (captchaCode) {
        formData.captcha = captchaCode;
        formData.width = captcha.width;
        formData.height = captcha.height;
    }
    return formData;
}

/**
 * 检测联系方式是否存在
 *
 */
exports.checkContactInfoExists = function(req, res) {
    const contactType = req.query.contactType;
    const contactInfo = req.query.contactInfo;
    const url = urls.checkContactInfoExists + contactType + '/' + contactInfo;

    return restUtil.appAuthRest.get(
        {
            url: url,
            req: req,
            res: res,
            headers: {
                session_id: req.sessionID
            }
        }, null);
};

/**
 * 获取操作码
 *
 */
exports.getOperateCode = function(req, res, user_name, captcha) {
    const url = urls.getOperateCode;

    return restUtil.appAuthRest.post(
        {
            url: url,
            req: req,
            res: res,
            headers: {
                session_id: req.sessionID,
            },
            form: {
                user_name: user_name,
                captcha: captcha,
            }
        }, null);
};

/**
 * 发送验证信息
 *
 */
exports.sendResetPasswordMsg = function(req, res, user_name, send_type, operate_code) {
    const url = urls.sendResetPasswordMsg;

    return restUtil.appAuthRest.post(
        {
            url: url,
            req: req,
            res: res,
            form: {
                user_name: user_name,
                send_type: send_type,
                operate_code: operate_code,
            }
        }, null);
};

/**
 * 获取凭证
 *
 */
exports.getTicket = function(req, res) {
    const url = urls.getTicket;
    return restUtil.appAuthRest.post(
        {
            url: url,
            req: req,
            res: res,
            headers: { session_id: req.sessionID },
            form: req.query,
        }, null);
};

/**
 * 重置密码
 *
 */
exports.resetPassword = function(req, res, user_id, ticket, new_password) {
    const url = urls.resetPassword;

    return restUtil.appAuthRest.post(
        {
            url: url,
            req: req,
            res: res,
            form: {
                user_id,
                ticket,
                new_password,
            }
        }, null);
};

/**
 * 获取扫码登录的二维码
 *
 */
exports.getLoginQRCode = function(req, res) {
    return restUtil.appAuthRest.post(
        {
            url: urls.getLoginQRCode,
            req: req,
            res: res,
        }, null);
};

/**
 * 扫码登录
 *
 */
exports.loginByQRCode = function(req, res, qrcode) {
    return restUtil.appAuthRest.post(
        {
            url: urls.loginByQRCode,
            req: req,
            res: res,
            //后端要求用form的post提交
            form: {
                screen_code: qrcode
            }
        }, null, {
            success: function(emitter, data) {
                //如果未返回数据
                if (!data) {
                    let backendIntl = new BackendIntl(req);
                    emitter.emit('error', backendIntl.get('login.service.error', '很抱歉,服务器出现了异常状况'));
                } else {
                    emitter.emit('success', getLoginResult(data));
                }
            },
            timeout: function(emitter, data) {
                emitter.emit('error', data);
            }
        });
};

//根据公司名获取公司
exports.getCompanyByName = function(req, res) {
    return restUtil.baseRest.get(
        {
            url: urls.getCompanyByName,
            req: req,
            res: res,
        }, req.query);
};

// 检查电话是否已经被注册过
exports.checkPhoneIsRegisted = function(req, res) {
    return restUtil.baseRest.get(
        {
            url: urls.checkPhoneIsRegisted,
            req: req,
            res: res,
        }, req.query);
};

//获取短信验证码
exports.getVertificationCode = function(req, res) {
    return restUtil.baseRest.get(
        {
            url: urls.getVertificationCode,
            req: req,
            res: res,
        }, req.query);
};
//注册个人账号
exports.registerAccount = function(req, res) {
    return restUtil.baseRest.post(
        {
            url: urls.registerAccount,
            req: req,
            res: res,
        }, req.body);
};
//短信验证码的验证
exports.validatePhoneCode = function(req, res) {
    return restUtil.baseRest.get(
        {
            url: urls.validatePhoneCode,
            req: req,
            res: res,
        }, req.query);
};
//注册，短信验证码验证失败三次后获取图片验证码
exports.getRegisterCaptchaCode = function(req, res) {
    return restUtil.baseRest.get(
        {
            url: urls.getRegisterCaptchaCode,
            req: req,
            res: res,
        }, {
            phone: req.query.phone,
            width: captcha.width,
            height: captcha.height
        });
};

//微信登录页面
exports.wechatLoginPage = function(req, res) {
    let qrconnecturl = 'https://open.weixin.qq.com/connect/qrconnect?appid=' + appUtils.WECHAT_APPID
        + '&redirect_uri=' + encodeURIComponent('https://ketao.antfact.com/login/wechat')
        + '&response_type=code&scope=snsapi_login&state=' + req.sessionID;
    // let params = {
    //     appid: WECHAT_APPID,
    //     redirect_uri: encodeURIComponent('https://ketao.antfact.com/login/wechat'),
    //     response_type: 'code',
    //     scope: 'snsapi_login',
    //     state: req.sessionID
    // };
    // Object.keys(params).forEach(function(key) {
    //     qrconnecturl += key + '=' + params[key] + '&';
    // });
    // qrconnecturl = qrconnecturl.slice(qrconnecturl.length - 1, 1);
    return restUtil.baseRest.get(
        {
            url: qrconnecturl,
            req: req,
            res: res
        });
};

//通过微信的unionId登录
exports.wechatLoginByUnionId = function(req, res, unionId) {
    return restUtil.appAuthRest.post(
        {
            url: urls.wechatLoginByUnionIdUrl,
            req: req,
            res: res,
            form: {
                open_id: unionId,
                platform: 'wechat'
            },
        }, null, {
            success: loginSuccess.bind(req),
            timeout: loginTimeout
        });
};

//检查微信是否已绑定客套账号
exports.checkWechatIsBind = function(req, res, unionId) {
    return restUtil.appAuthRest.get(
        {
            url: urls.checkWechatIsBindUrl,
            req: req,
            res: res,
        }, {
            open_id: unionId,
            platform: 'wechat'
        });
};

//微信登录
exports.loginWithWechat = function(req, res, code) {
    let access_token_url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    let params = {
        appid: appUtils.WECHAT_APPID,
        secret: appUtils.WECHAT_SECRET,
        code: code,
        grant_type: 'authorization_code'
    };
    // Object.keys(params).forEach(function(key) {
    //     access_token_url += key + '=' + params[key] + '&';
    // });
    // access_token_url = access_token_url.slice(access_token_url.length - 1, 1);
    return restUtil.baseRest.get(
        {
            url: access_token_url,
            req: req,
            res: res,
        }, params);


};
//微信小程序登录
exports.loginWithWechatMiniprogram = function(req, res, code) {
    let access_token_url = 'https://api.weixin.qq.com/sns/jscode2session';
    let params = {
        appid: appUtils.MINI_PROGRAM_APPID,
        secret: appUtils.MINI_PROGRAM_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
    };
    return restUtil.baseRest.get(
        {
            url: access_token_url,
            req: req,
            res: res,
        }, params);
};

//注册新用户绑定微信号并登录
exports.registBindWechatLogin = function(req, res, formObj) {
    let formData = {
        user_name: formObj.user_name,
        open_id: formObj.union_id,
        valid_days: 30,//授权有效期(Integer),默认先写死30天
        platform: 'wechat'
    };
    //密码是可选项，可填可不填
    if (formObj.password) {
        formData.password = formObj.password;
    }
    return restUtil.appAuthRest.post(
        {
            url: urls.registBindWechatLoginUrl,
            req: req,
            res: res,
            form: formData,
        }, null, {
            success: loginSuccess.bind(req),
            timeout: loginTimeout
        });
};

//已有账号绑定微信
exports.bindWechat = function(req, res, unionId) {
    return restUtil.authRest.post(
        {
            url: urls.bindWechatUrl,
            req: req,
            res: res,
            headers: {
                realm: global.config.loginParams.realm
            },
            form: {
                open_id: unionId,
                platform: 'wechat'
            }
        });
};
//解绑微信
exports.unbindWechat = function(req, res) {
    return restUtil.authRest.post(
        {
            url: urls.unbindWechatUrl,
            req: req,
            res: res,
            headers: {
                realm: global.config.loginParams.realm
            },
            form: {
                platform: 'wechat'
            }
        });
};

//登录后判断是否已绑定微信
exports.checkLoginWechatIsBind = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.checkLoginWechatIsBindUrl,
            req: req,
            res: res,
            headers: {
                realm: global.config.loginParams.realm
            }
        });
};

//获得登录用户所在组织
exports.getOrganization = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.getOrganization,
            req: req,
            res: res
        }, null);
};