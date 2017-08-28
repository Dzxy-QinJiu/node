//获取当前页要展示的域列表
var curRealmListAjax = null;

exports.getCurRealmList = function (searchObj) {

    var Deferred = $.Deferred();

    curRealmListAjax && curRealmListAjax.abort();

    curRealmListAjax = $.ajax({
        url: '/rest/realm',
        dataType: 'json',
        type: 'get',
        data: searchObj,
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (xhr, textStatus) {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//通过id获取当前安全域详细信息
exports.getCurRealmById = function (realmId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/realm/' + realmId,
        dataType: 'json',
        type: 'get',
        success: function (realm) {
            Deferred.resolve(realm);
        }
    });
    return Deferred.promise();
};

//添加域
exports.addRealm = function (realm) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/realm',
        dataType: 'json',
        type: 'post',
        data: realm,
        timeout: 60 * 1000,
        success: function (realmCreated) {
            Deferred.resolve(realmCreated);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//添加所有者
exports.addOwner = function (owner) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/realm/owner',
        dataType: 'json',
        type: 'post',
        data: owner,
        timeout: 60 * 1000,
        success: function (ownerCreated) {
            Deferred.resolve(ownerCreated);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改域
exports.editRealm = function (realm) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/realm',
        dataType: 'json',
        type: 'put',
        data: realm,
        success: function (realmModified) {
            Deferred.resolve(realmModified);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//启停安全域
exports.updateRealmStatus = function (realm) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/realm/status',
        dataType: 'json',
        type: 'put',
        data: realm,
        success: function (data) {
            Deferred.resolve(data);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//验证所有者用户名唯一性
exports.checkOnlyUserName = function (userName) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_name/' + userName,
        dataType: 'json',
        type: 'get',
        success: function (result) {
            Deferred.resolve(result);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//验证所有者电话唯一性
exports.checkOnlyOwnerPhone = function (phone) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_phone/' + phone,
        dataType: 'json',
        type: 'get',
        success: function (result) {
            Deferred.resolve(result);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//验证所有者电话唯一性
exports.checkOnlyOwnerEmail = function (email) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_email/' + email,
        dataType: 'json',
        type: 'get',
        success: function (result) {
            Deferred.resolve(result);
        }, error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
