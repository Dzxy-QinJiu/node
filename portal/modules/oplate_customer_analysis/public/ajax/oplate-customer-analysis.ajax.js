import ajax from "../../../common/ajax";
const routes  = require("../../../common/route");

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


//查询迁出客户
exports.getTransferCustomers = function(paramObj) {
    const handler = "getTransferCustomers";
    const route = routes.find(x => x.handler == handler);
    const {page_size, sort_field, order} = paramObj;
    let queryObj = $.extend(true, {}, paramObj.query);
    paramObj.query = {};
    return ajax({
        url: route.path,
        type: route.method,
        query: queryObj,
        params: {
            page_size, 
            sort_field, 
            order
        },
        data: paramObj
    })
};

//获取客户阶段变更数据todo
exports.getStageChangeCustomers = function(paramObj) {
    const handler = "getStageChangeCustomers";
    const route = routes.find(x => x.handler == handler);
    const {page_size, sort_field, order} = paramObj;
    let queryObj = $.extend(true, {}, paramObj.queryObj);
    paramObj.query = {};
    return ajax({
        url: route.path,
        type: route.method,
        query: queryObj,
        params: {
            page_size, 
            sort_field, 
            order
        },
        data: paramObj
    })
};
