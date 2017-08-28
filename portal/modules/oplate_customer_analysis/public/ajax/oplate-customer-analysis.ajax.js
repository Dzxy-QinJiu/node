//获取统计总数
var summaryNumbersAjax;
exports.getSummaryNumbers = function(reqData) {
    summaryNumbersAjax && summaryNumbersAjax.abort();
    reqData = reqData || {};
    var Deferred = $.Deferred();
    summaryNumbersAjax = $.ajax({
        url: '/rest/analysis/customer/summary',
        dataType: 'json',
        type: 'get',
        timeout: 180 * 1000,
        data: reqData,
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取具体统计数据
var analysisDataAjax = {};
exports.getAnalysisData = function(reqData) {
    analysisDataAjax[reqData.customerProperty] && analysisDataAjax[reqData.customerProperty].abort();
    reqData = reqData || {};
    var Deferred = $.Deferred();
    analysisDataAjax[reqData.customerProperty] = $.ajax({
        url: '/rest/analysis/customer/' + reqData.customerType + '/' + reqData.customerProperty,
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

exports.getUserType = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/group_position',
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

//获取销售阶段列表
exports.getSalesStageList = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_stage_list',
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        }
    });
    return Deferred.promise();
};

