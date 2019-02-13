var Q = require('q');
var UserDto = require('./user-dto');
var _ = require('lodash');
/*
 *
 * user
 * {
 *  token:String,
 *  userid:String,
 *  username:String,
 *  ...
 * }
 *
 */
//获取token
function getAccesstoken(req) {
    var user = UserDto.turnSessionDataToUser(req && req.session);
    return (user && user.auth.access_token) || '';
}
//获取用户信息
function getUser(req) {
    return UserDto.turnSessionDataToUser(req && req.session) || {};
}
//清除session的内容
function clean(req, res) {
    //defer机制
    var deferred = Q.defer();
    req.session.destroy(function() {
        deferred.resolve();
    });
    return deferred.promise;
}

//向系统中保存用户的信息
/**
 * @param req
 * @param user
 *
 * 将token和licensekey保存到session中
 * 将userId和account和name保存到cookie中
 */
function saveUserInfo(req, user) {
    //defer机制
    var deferred = Q.defer();
    //用户信息保存到session中
    var userData = UserDto.toSessionData(req,user);
    req.session.user = userData.user;
    req.session['_USER_TOKEN_'] = userData['_USER_TOKEN_'];
    req.session.save(function() {
        deferred.resolve();
    });
    return deferred.promise;
}

//是否含有某个角色
function hasRole(req,role) {
    var user = req && req.session && req.session.user || {};
    if(!_.isObject(user)) {
        user = {};
    }
    var roles = user.roles || [];
    if(!_.isArray(roles)) {
        roles = [];
    }
    return roles.indexOf(role) >= 0;
}
//是否含有某个权限
function hasPrivilege(req, privilege) {
    let user = getUser(req);
    return _.indexOf(user.privileges, privilege) > -1;
}

// 获取项目运行的语言
function getLang() {
    return global.config.lang;
}

//角色对应单词
const ROLE_CONSTANTS = {
    //运营人员
    OPERATION_PERSON: 'operations',
    //销售
    SALES: 'sales',
    //舆情秘书
    SECRETARY: 'salesmanager',
    //销售负责人
    SALES_LEADER: 'salesleader',
    //组织管理员
    REALM_ADMIN: 'realm_manager',
    //组织所有者
    REALM_OWNER: 'realm_owner',
    //合同管理员
    CONTRACT_ADMIN: 'contract_manager',
    //财务
    ACCOUNTANT: 'accountant'
};

exports.hasRole = hasRole;
exports.ROLE_CONSTANTS = ROLE_CONSTANTS;
exports.getToken = getAccesstoken;
exports.clean = clean;
exports.saveUserInfo = saveUserInfo;
exports.getUser = getUser;
exports.getLang = getLang;
exports.hasPrivilege = hasPrivilege;
