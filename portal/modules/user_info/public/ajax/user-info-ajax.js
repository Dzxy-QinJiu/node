//获取用户信息
exports.getUserInfo = () => {
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_info',
        dataType: 'json',
        type: 'get',
        success: function(usrInfo) {
            Deferred.resolve(usrInfo);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    })
    ;
    return Deferred.promise();
};

//获取登录日志
exports.getLogList = function(params) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/log_list',
        dataType: 'json',
        type: 'get',
        data: params,
        success: function(logList) {
            Deferred.resolve(logList);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.activeUserEmail = function(bodyObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_email/active',
        dataType: 'json',
        type: 'post',
        data: bodyObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改个人信息
exports.editUserInfo = function(userInfo) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_info',
        dataType: 'json',
        type: 'put',
        data: userInfo,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//设置语言环境
exports.setUserLanguage = function(userLang) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_lang',
        dataType: 'json',
        type: 'post',
        data: userLang,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改密码
exports.editUserInfoPwd = function(userInfo) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_info_pwd',
        dataType: 'json',
        type: 'put',
        data: userInfo,
        success: function(userInfoModified) {
            Deferred.resolve(userInfoModified);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON || Intl.get('user.info.edit.password.failed','密码修改失败'));
        }
    });
    return Deferred.promise();
};

//校验密码
exports.checkUserInfoPwd = function(userInfo) {
    var Deferred = $.Deferred();

    $.ajax({
        url: '/rest/user_info_pwd',
        type: 'get',
        data: userInfo,
        success: function(userInfoModified) {
            Deferred.resolve(userInfoModified.flag);
        }
    });
    return Deferred.promise();
};
exports.setSubscribeEmail = function(configObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/info_email/subscribe',
        dataType: 'json',
        type: 'post',
        data: configObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取用户交易记录
exports.getUserTradeRecord = (queryObj) => {
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/user/trade/record',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: (resData) => {
            Deferred.resolve(resData);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('user.trade.get.record','获取购买记录失败'));
        }
    });
    return Deferred.promise();
};