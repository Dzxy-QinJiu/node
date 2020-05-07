var appAjaxTrans = require('MOD_DIR/common/public/ajax/app');
//根据客户id获取客户信息
exports.getCustomerById = function(data) {
    var Deferred = $.Deferred();
    var pageSize = 10;
    $.ajax({
        url: '/rest/customer/range/' + pageSize + '/1/' + 'start_time' + '/' + 'descend',
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取应用列表
var getAppListsAjax;
exports.getAppLists = function() {
    getAppListsAjax && getAppListsAjax.abort();
    var Deferred = $.Deferred();
    getAppListsAjax = appAjaxTrans.getGrantApplicationListAjax().sendRequest()
        .success(function(list) {
            Deferred.resolve(list);
        }).error(function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }).timeout(function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        });
    return Deferred.promise();
};
//增加产品反馈
var addAppFeedbackAjax;
exports.addAppFeedback = function(sumbitObj) {
    addAppFeedbackAjax && addAppFeedbackAjax.abort();
    var Deferred = $.Deferred();
    // sumbitObj.product = JSON.stringify(sumbitObj.product);
    addAppFeedbackAjax = $.ajax({
        url: '/rest/base/add/appfeedback',
        dataType: 'json',
        type: 'post',
        data: sumbitObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};