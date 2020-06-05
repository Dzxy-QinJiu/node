var UserData;
import { storageUtil } from 'ant-utils';
//通过ajax获取
exports.getUserDataByAjax = function() {
    var deferred = $.Deferred();

    function ajax() {
        $.getJSON('/user/data.js?callback=?').done(function(data) {
            UserData = _.isObject(data) ? data : {};
            storageUtil.setUserId(UserData.user_id);
            //语言环境的设置
            Oplate.lang = _.isObject(data) ? data.lang : 'zh_CN';
            if (_.get(data, 'websiteConfig.personnel_setting')) {
                storageUtil.local.set('websiteConfig', JSON.stringify(data.websiteConfig.personnel_setting));
            } else {
                storageUtil.local.set('websiteConfig', JSON.stringify({}));
            }
            deferred.resolve();
        }).error(function(data) {
            let errorMsg = '';
            if (_.isObject(data.responseJSON)) {
                //语言环境的设置
                Oplate.lang = data.responseJSON.lang || 'zh_CN';
                errorMsg = data.responseJSON.errorMsg;
            } else {
                errorMsg = data.reponseJSON;
            }
            //如果是403且是token过期，表示通过全局token处理返回的error，则会在全局处理，这里不再处理；
            //否则，表示自己的rest请求处理返回的错误，需要显示到界面上
            if (data.status === 403 && errorMsg === Intl.get('errorcode.38', 'Token过期')) {
                return;
            } else {
                //其他错误显示到界面上
                deferred.reject(errorMsg);
            }
        });
    }

    ajax();
    return deferred.promise();
};
//更新缓存中的登录用户的头像信息
exports.updateUserLogo = function(userLogoInfo) {
    //修改完个人资料或成员管理中对应的登录用户的信息后更新
    UserData.nick_name = userLogoInfo.nickName;
    UserData.user_logo = userLogoInfo.userLogo;
};

//直接获取用户数据
exports.getUserData = function() {
    return UserData;
};


//设置用户数据
exports.setUserData = function(key, value) {
    UserData[key] = value;
};

//用户是否含有某个角色
exports.hasRole = function(role) {
    const roles = UserData.roles || [];
    if (roles.indexOf(role) >= 0) {
        return true;
    }
    return false;
};

//用户是否含有某个角色
exports.hasOnlyRole = function(role) {
    const roles = UserData.roles || [];
    if (roles.indexOf(role) >= 0 && roles.length === 1) {
        return true;
    }
    return false;
};

exports.ROLE_CONSTANS = require('../../lib/consts').ROLE_CONSTANS;

