var getCustomerByPhoneAjax;
exports.getCustomerByPhone = function(data) {
    getCustomerByPhoneAjax && getCustomerByPhoneAjax.abort();
    var Deferred = $.Deferred();
    var pageSize = 10;
    getCustomerByPhoneAjax = $.ajax({
        url: '/rest/customer/v2/customer/range/' + pageSize + "/" + "start_time" + "/" + "descend",
        dataType: 'json',
        type: 'post',
        data: data,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//获取应用列表
var getAppListsAjax;
exports.getAppLists = function () {
    getAppListsAjax && getAppListsAjax.abort();
    var Deferred = $.Deferred();
    getAppListsAjax = $.ajax({
        url: '/rest/base/phonecall/application',
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};
//增加产品反馈
var addAppFeedbackAjax;
exports.addAppFeedback = function (sumbitObj) {
    addAppFeedbackAjax && addAppFeedbackAjax.abort();
    var Deferred = $.Deferred();
    // sumbitObj.product = JSON.stringify(sumbitObj.product);
    addAppFeedbackAjax = $.ajax({
        url: '/rest/base/add/appfeedback',
        dataType: 'json',
        type: 'post',
        data: sumbitObj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
}