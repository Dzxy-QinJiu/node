var userData = require("../../../../public/sources/user-data");

//获取当前页的应用列表
var getCallRecordAjax = null;

exports.getCallRecordList = function (params, filterObj) {
    let  queryObj = {};
    $.extend(queryObj, filterObj);
    if (queryObj.type &&  queryObj.type == 'all' || queryObj.disposition &&  queryObj.disposition == 'ALL') {
        delete queryObj.type;
        delete queryObj.disposition;
    }
    var Deferred = $.Deferred();

    getCallRecordAjax && getCallRecordAjax.abort();
    let url = '/rest/call_record/' + params.start_time + '/' + params.end_time + '/' + params.page_size + "/" + params.sort_field + "/" + params.sort_order;
    if (params.lastId) {
        url += "?id=" + params.lastId;
        if (params.filter_phone === false) {
            url += "&filter_phone=" + params.filter_phone;
        }
    }else if (params.filter_phone === false) {
        url += "?filter_phone=" + params.filter_phone;
    }
    getCallRecordAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function (appList) {
            Deferred.resolve(appList);
        },
        error: function (xhr, textStatus) {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 编辑通话记录中跟进内容
exports.editCallTraceContent = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url : '/rest/call/edit/content',
        dataType : 'json',
        type : 'put',
        data : queryObj,
        success : function(data) {
            Deferred.resolve(data);
        },
        error : function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 搜索电话号码号码时，提供推荐列表
exports.getRecommendPhoneList = function(params, queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url : '/rest/call/search/phone_number/' + params.filter_phone,
        dataType : 'json',
        type : 'post',
        data : queryObj,
        success : function(data) {
            Deferred.resolve(data);
        },
        error : function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};