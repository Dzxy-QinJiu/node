exports.getAlertList = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/alert',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.addAlert = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/alert',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.editAlert = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/alert',
        dataType: 'json',
        type: 'put',
        data: reqData,
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.deleteAlert = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/alert',
        dataType: 'json',
        type: 'delete',
        data: reqData,
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

