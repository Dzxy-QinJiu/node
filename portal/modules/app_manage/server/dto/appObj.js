/**
 * Created by wangliping on 2016/2/22.
 * 应用实体
 */
exports.App = function(opts) {
    this.appId = opts.client_id;
    this.appName = opts.client_name || "";//应用名称
    this.redirectUrl = opts.redirect_url || "";//应用URL
    this.appLogo = opts.client_logo || "";//应用Logo
    this.owner = opts.owner_id || "";//应用的所有者id
    this.appDesc = opts.client_desc || "";//应用的描述
    this.status = opts.status || "";//应用的状态
};

exports.toFrontObject = function(restObject) {
    var frontObj = {};
    frontObj.id = restObject.client_id;
    frontObj.name = restObject.client_name || "";
    frontObj.image = restObject.client_logo || "";
    frontObj.tags = restObject.tags;
    frontObj.status = restObject.status;
    frontObj.appUrl = restObject.redirect_url || "";
    //获取应用列表和保存后返回的是ownerName;
    frontObj.ownerId = restObject.owner_id;
    frontObj.ownerName = restObject.owner_name;
    frontObj.descr = restObject.client_desc;
    //输错几次密码出验证码
    frontObj.captchaTime = restObject.captcha_time;
    //ip超频几次出验证码
    frontObj.ipCaptcha = restObject.ip_captcha;
    //session超频几次出验证码
    frontObj.sessionCaptcha = restObject.session_captcha;
    var managers = restObject.managers || [];
    managers = managers.map(function(manager) {
        return {
            managerId: manager.manager_id,
            managerName: manager.manager_name
        };
    });
    frontObj.managers = managers || [];
    if (restObject.secret_client) {
        frontObj.secretAppId = restObject.secret_client;
    }
    if (restObject.secretclient_name) {
        frontObj.secretAppName = restObject.secretclient_name;
    }
    if (restObject.create_date) {
        frontObj.createDate = restObject.create_date;
    }
    if (restObject.expire_date) {
        frontObj.expireDate = restObject.expire_date;
    }
    return frontObj;
};
exports.toRestObject = function(frontObj) {
    var restObject = {};
    restObject.client_id = frontObj.id;
    if (frontObj.appUrl) {
        restObject.redirect_url = frontObj.appUrl;
    }
    if (frontObj.image) {
        restObject.client_logo = frontObj.image;
    }
    if (frontObj.status || frontObj.status == 0) {
        restObject.status = frontObj.status;
    }
    if (frontObj.descr || frontObj.descr === "") {
        restObject.client_desc = frontObj.descr;
    }
    if (frontObj.name) {
        restObject.client_name = frontObj.name;
    }
    if (frontObj.tags) {
        restObject.tags = JSON.parse(frontObj.tags);
    }
    if (frontObj.owner) {
        //添加、编辑时，往后台传的是ownerId
        restObject.owner_id = frontObj.owner;
    }
    if (frontObj.managers) {
        restObject.manager_ids = JSON.parse(frontObj.managers);
    }
    if (frontObj.secretApp) {
        restObject.secret_client = frontObj.secretApp;
    }
    return restObject;
};

exports.toRestStatusObject = function(frontObj) {
    var statusObj = {};
    statusObj.client_id = frontObj.id;
    statusObj.status = frontObj.status;
    return statusObj;
};
