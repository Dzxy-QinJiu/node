const _ = require('lodash');
/**
 * App是前端界面使用的应用对象
 * @param obj 服务端返回的应用对象
 */
function App(obj) {
    this.app_id = obj.id || '';
    this.app_name = obj.name || '';
    this.app_logo = obj.full_image || '';
    this.terminals = obj.terminals || [];
}

exports.App = App;
exports.toFrontObject = function(restObject) {
    var frontObj = {};
    frontObj.id = restObject.client_id;
    frontObj.name = restObject.client_name || '';
    frontObj.image = restObject.client_logo || '';
    frontObj.tags = restObject.tags;
    frontObj.status = restObject.status;
    frontObj.appUrl = restObject.redirect_url || '';
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
// 删除子部门里一些没用的属性
exports.DeleteChildDepartment = function(childGroup) {
    const removeChildSomeData = (childGroup) => {
        if (_.isArray(childGroup) && childGroup.length) {
            _.each(childGroup, (childItem) => {
                delete childItem.client_id;
                delete childItem.create_date;
                removeChildSomeData(childItem.child_groups);
            });
        }
    };
    removeChildSomeData(childGroup);
};