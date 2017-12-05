// 获取通话时长为TOP10的列表
let callDurTopTenAjax = null;
exports.getCallDurTopTen = function (reqData, reqBody) {
    callDurTopTenAjax && callDurTopTenAjax.abort();
    let url = '/rest/call/duration/top/ten/' + reqData.start_time + '/' +
        reqData.end_time + '/' + reqData.page_size + "/" + reqData.sort_field + "/" + reqData.sort_order;
    var Deferred = $.Deferred();
    callDurTopTenAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取通话数量和通话时长趋势图统计
let callCountAndDurAjax = null;
exports.getCallCountAndDur = function (reqData, reqBody) {
    callCountAndDurAjax && callCountAndDurAjax.abort();
    let url = '/rest/call/duration/count/' + reqData.start_time + '/' + reqData.end_time;
    var Deferred = $.Deferred();
    callCountAndDurAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取电话的接通情况
exports.getCallInfo = function (pathParam, reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/call/info/' + pathParam.type,
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 114占比
let callRateAjax = {
    "114": null,
    "service": null
};
exports.getCallRate = function (reqData, reqBody, type) {
    callRateAjax[type] && callRateAjax[type].abort();
    var Deferred = $.Deferred();
    callRateAjax[type] = $.ajax({
        url: '/rest/call/rate/' + reqData.start_time + '/' + reqData.end_time,
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取通话时段（数量和时长）的统计数据
let callIntervalAjax = null;
exports.getCallIntervalData = function (authType, reqData) {
    callIntervalAjax && callIntervalAjax.abort();
    var Deferred = $.Deferred();
    callIntervalAjax = $.ajax({
        url: '/rest/call/interval_data/' + authType,
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 获取团队信息
exports.getSaleGroupTeams = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/sale/teams/' + reqData.type,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取成员信息
exports.getSaleMemberList = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/sale/member/' + reqData.type,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
