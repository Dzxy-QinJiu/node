var appAjaxTrans = require("../../../common/public/ajax/app");
exports.getAppList = function () {
    var Deferred = $.Deferred();
    appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(function(list) {
        list = list.map(function(app) {
            return {
                client_id : app.app_id,
                client_name : app.app_name,
                client_logo : app.app_logo
            };
        });
        Deferred.resolve(list);
    }).error(function(errorMsg) {
        Deferred.reject(errorMsg.responseJSON);
    }).timeout(function(errorMsg) {
        Deferred.reject(errorMsg.responseJSON);
    });
    return Deferred.promise();
};

exports.getTeamList = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/child_groups',
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.getStageList = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/v2/salesopportunity/term/sale_stages',
        dataType: 'json',
        type: 'post',
        data: {reqData: JSON.stringify({})},
        success: function (resData) {
            Deferred.resolve(resData.result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.getTagList = function () {
    var pageSize = 100;
    var num = 1;
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/get_recommend_tags/' + pageSize + '/' + num,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data.result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取行业列表
exports.getIndustries = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm_filter/industries',
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
