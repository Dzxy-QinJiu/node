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
    frontObj.id = restObject.user_id; // 成员id
    frontObj.userName = restObject.user_name || ''; // 账号
    frontObj.name = restObject.nick_name || ''; // 昵称
    frontObj.image = restObject.user_logo || ''; // 图像
    frontObj.password = '密码******';
    frontObj.rePassword = '密码******';
    frontObj.phone = restObject.phone || ''; // 手机
    frontObj.email = restObject.email || ''; // 邮箱
    frontObj.qq = restObject.qq || ''; // qq
    frontObj.phoneOrder = restObject.phone_order || '';
    frontObj.positionName = restObject.teamrole_name || ''; // 职务
    frontObj.positionId = restObject.teamrole_id || ''; // 职务id
    //邮箱是否激活的状态
    frontObj.emailEnable = restObject.email_enable;
    let roles = restObject.roles || []; // 角色
    frontObj.roleIds = _.map(roles, 'role_id');
    frontObj.roleNames = _.map(roles, 'role_name');
    if (restObject.team_name) {
        frontObj.teamName = restObject.team_name; // 部门
    }
    if (restObject.team_id) { // 部门id
        frontObj.teamId = restObject.team_id;
    }
    let user_client = restObject.user_client;
    frontObj.status = user_client && Array.isArray(user_client) && user_client.length && user_client[0].status;
    if (restObject.create_date) { // 创建时间
        frontObj.createDate = restObject.create_date;
    }
    // 停用时间
    let disableDate = restObject.disable_date;
    if (disableDate) {
        frontObj.disableDate = disableDate;
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
    let qq = frontObj.qq;
    if (qq) {
        restObject.qq = qq;
    }
    if (frontObj.phone || frontObj.phone === '') {
        restObject.phone = frontObj.phone;
    }
    if (frontObj.email || frontObj.email === '') {
        restObject.email = frontObj.email;
    }
    if (frontObj.role) {
        let role = frontObj.role;
        restObject.roles = [{role_id: role}];
    }
    if (frontObj.team) {
        restObject.team_id = frontObj.team;
    }
    if (frontObj.phoneOrder) {
        restObject.phone_order = frontObj.phoneOrder;
    }
    //添加成员成功后，激活邮件中的url（需要区分是https://ent.curtao.com还是https://csm.curtao.com）
    if(frontObj.activate_url){
        restObject.activate_url = frontObj.activate_url;
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
