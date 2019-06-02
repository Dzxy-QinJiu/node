let _ = require('lodash');
exports.User = function(opts) {
    this.userId = opts.user_id;
    //用户账号
    this.userName = opts.user_name || '';
    //用户姓名
    this.name = opts.nick_name || '';
    //用户的头像
    this.userLogo = opts.user_logo || '';
    //密码
    //this.password = opts.password || "密码";
    //电话
    this.phone = opts.phone || '';
    //邮箱
    this.email = opts.email || '';
    //角色
    this.roles = opts.roles || [];
    // 座席号
    this.phoneOrder = opts.opts || '';
};

exports.toFrontObject = function(restObject) {
    let frontObj = {};
    frontObj.id = restObject.user_id;
    frontObj.userName = restObject.user_name || '';
    frontObj.name = restObject.nick_name || '';
    frontObj.image = restObject.user_logo || '';
    frontObj.password = '密码******';
    frontObj.rePassword = '密码******';
    frontObj.phone = restObject.phone || '';
    frontObj.email = restObject.email || '';
    frontObj.phoneOrder = restObject.phone_order || '';
    //邮箱是否激活的状态
    frontObj.emailEnable = restObject.email_enable;
    let roles = restObject.roles || [];
    frontObj.roleIds = _.map(roles, 'role_id');
    frontObj.roleNames = _.map(roles, 'role_name');
    if (restObject.team_name) {
        frontObj.teamName = restObject.team_name;
    }
    if (restObject.team_id) {
        frontObj.teamId = restObject.team_id;
    }
    let user_client = restObject.user_client;
    frontObj.status = user_client && Array.isArray(user_client) && user_client.length && user_client[0].status;
    if (restObject.create_date) {
        frontObj.createDate = restObject.create_date;
    }
    return frontObj;
};

exports.toRestObject = function(frontObj) {
    let restObject = {};
    restObject.user_id = frontObj.id;
    if (frontObj.userName) {
        restObject.user_name = frontObj.userName;
    }
    if (frontObj.password && frontObj.password.indexOf('密码') === -1) {
        restObject.password = frontObj.password;
    }
    if (frontObj.image) {
        restObject.user_logo = frontObj.image;
    }
    if (frontObj.name) {
        restObject.nick_name = frontObj.name;
    }
    if (frontObj.phone || frontObj.phone === '') {
        restObject.phone = frontObj.phone;
    }
    if (frontObj.email || frontObj.email === '') {
        restObject.email = frontObj.email;
    }
    if (frontObj.role) {
        let role = JSON.parse(frontObj.role);
        if (role && role.length > 0) {
            restObject.roles = [];
            for (let i = 0, len = role.length; i < len; i++) {
                restObject.roles.push({role_id: role[i]});
            }
        }
    }
    if (frontObj.team) {
        restObject.team_id = frontObj.team;
    }
    if (frontObj.phoneOrder) {
        restObject.phone_order = frontObj.phoneOrder;
    }
    restObject.realm_id = '15TqaEat';
    return restObject;
};

//停用、启用修改时，对象的转换
exports.toRestStatusObject = function(frontObj) {
    let statusObj = {};
    statusObj.user_id = frontObj.id;
    statusObj.status = frontObj.status;
    return statusObj;
};
