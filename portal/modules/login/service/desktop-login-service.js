var restLogger = require("../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var config = require('../../../../conf/config');
//后端国际化
let BackendIntl = require("../../../lib/utils/backend_intl");
const ipUtil = require("../../../lib/utils/common-utils").ip;

//定义url
var urls = {
    //登录
    login: "/auth2/authc/login",
    //获取验证码
    getLoginCaptcha: "/auth2/authc/captcha/get",
    //刷新验证码
    refreshLoginCaptcha: "/auth2/authc/captcha/refresh",
    //获取重置密码验证码
    getResetPasswordCaptcha: "/auth2/authc/reset_password/captcha",
    //检查联系方式是否存在
    checkContactInfoExists: "/auth2/rs/users/",
    //获取操作码
    getOperateCode: "/auth2/authc/reset_password/getPhoneAndEmail",
    //发送验证信息
    sendResetPasswordMsg: "/auth2/authc/reset_password/send_msg",
    //通过验证码换取临时票据
    getTicket: "/auth2/authc/reset_password/ticket",
    //重置密码
    resetPassword: "/auth2/authc/reset_password/update",
    //根据ticket登录
    loginWithTicket: "/auth2/authc/third_login/login",
    //获取扫码登录的二维码
    getLoginQRCode: "/auth2/authc/scan_code/screen_code",
    //通过扫码登录
    loginByQRCode: "/auth2/authc/scan_code/login"

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
exports.login = function (req, res, username, password, captchaCode) {
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
            success: loginSuccess,
            timeout: loginTimeout
        });
};
/*
 根据ticket登录
 */
exports.loginWithTicket = function (req, res, ticket) {
    return restUtil.appAuthRest.post({
        url: urls.loginWithTicket,
        req: req,
        res: res,
        form: {
            ticket: ticket
        }
    }, null, {
        success: loginSuccess,
        timeout: loginTimeout
    });
};
/**
 * 登录超时处理
 */
function loginTimeout(emitter, data) {
    if (emitter) {
        emitter.emit("error", data);
    }
};
/*
 登录成功处理
 */
function loginSuccess(emitter, data) {
    if (emitter) {
        //如果未返回数据
        if (!data) {
            let backendIntl = new BackendIntl(req);
            emitter.emit("error", backendIntl.get("login.service.error", "很抱歉,服务器出现了异常状况"));
        } else {
            emitter.emit("success", getLoginResult(data));
        }
    }
}
//处理返回用户信息
function getLoginResult(data) {
    //前端登录后所需数据结构
    var loginResult = {
        auth: {
            client_id: "other",
            realm_id: "",
            access_token: "",
            refresh_token: ""
        },
        nick_name: "",
        privileges: [],
        user_id: "",
        user_name: ""
    };
    if (data.token) {
        loginResult.auth.access_token = data.token.access_token || "";
        loginResult.auth.refresh_token = data.token.refresh_token || "";
    }
    var userData = data.user;
    if (userData) {
        //realm_id
        if (userData.managed_realms && userData.managed_realms.length > 0) {
            loginResult.auth.realm_id = userData.managed_realms[0];
        }
        var userClients = userData.user_client;
        if (userClients && userClients.length > 0) {
            var userClient = userClients[0];
            if (userClient) {
                //privileges
                var permissions = userClient.permission_infos || [];
                if (permissions && permissions.length > 0) {
                    loginResult.privileges = permissions.map(function (permission) {
                        return permission.permission_define;
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
exports.getLoginCaptcha = function (req, res, user_name, type) {
    var url = urls.getLoginCaptcha;
    var headers = {
        session_id: req.sessionID
    };
    if (type) {
        url = urls.getResetPasswordCaptcha;
        headers.remote_addr = ipUtil.getServerAddresses();
        headers.user_ip = ipUtil.getClientIp(req);
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
exports.refreshLoginCaptcha = function (req, res, user_name, type) {
    var url = urls.refreshLoginCaptcha;
    var headers = {
        session_id: req.sessionID
    };

    if (type) {
        url = urls.getResetPasswordCaptcha;

        headers.remote_addr = ipUtil.getServerAddresses();
        headers.user_ip = ipUtil.getClientIp(req);
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
exports.checkContactInfoExists = function (req, res) {
    const contactType = req.query.contactType;
    const contactInfo = req.query.contactInfo;
    const url = urls.checkContactInfoExists + contactType + "/" + contactInfo;

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
exports.getOperateCode = function (req, res, user_name, captcha) {
    const url = urls.getOperateCode;

    return restUtil.appAuthRest.post(
        {
            url: url,
            req: req,
            res: res,
            headers: {
                session_id: req.sessionID,
                remote_addr: ipUtil.getServerAddresses(),
                user_ip: ipUtil.getClientIp(req),
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
exports.sendResetPasswordMsg = function (req, res, user_name, send_type, operate_code) {
    const url = urls.sendResetPasswordMsg;

    return restUtil.appAuthRest.post(
        {
            url: url,
            req: req,
            res: res,
            headers: {
                remote_addr: ipUtil.getServerAddresses(),
                user_ip: ipUtil.getClientIp(req),
            },
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
exports.getTicket = function (req, res, user_id, code) {
    const url = urls.getTicket;

    return restUtil.appAuthRest.post(
        {
            url: url,
            req: req,
            res: res,
            headers: {
                remote_addr: ipUtil.getServerAddresses(),
                user_ip: ipUtil.getClientIp(req),
            },
            form: {
                user_id,
                code,
            }
        }, null);
};

/**
 * 重置密码
 *
 */
exports.resetPassword = function (req, res, user_id, ticket, new_password) {
    const url = urls.resetPassword;

    return restUtil.appAuthRest.post(
        {
            url: url,
            req: req,
            res: res,
            headers: {
                remote_addr: ipUtil.getServerAddresses(),
                user_ip: ipUtil.getClientIp(req),
            },
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
exports.getLoginQRCode = function (req, res) {
    return restUtil.appAuthRest.post(
        {
            url: urls.getLoginQRCode,
            req: req,
            res: res
        }, null);
};

/**
 * 扫码登录
 *
 */
exports.loginByQRCode = function (req, res, qrcode) {
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
            success: function (emitter, data) {
                //如果未返回数据
                if (!data) {
                    let backendIntl = new BackendIntl(req);
                    emitter.emit("error", backendIntl.get("login.service.error", "很抱歉,服务器出现了异常状况"));
                } else {
                    emitter.emit("success", getLoginResult(data));
                }
            },
            timeout: function (emitter, data) {
                emitter.emit("error", data);
            }
        });
};


