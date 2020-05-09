import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import call_record_privilegeConst from '../privilege-const';
// 获取通话时长为TOP10的列表
let callDurTopTenAjax = null;
exports.getCallDurTopTen = function(reqData, reqBody) {
    let auth_type = hasPrivilege(call_record_privilegeConst.CURTAO_CRM_TRACE_QUERY_ALL) ? 'manager' : 'user';
    callDurTopTenAjax && callDurTopTenAjax.abort();
    let url = '/rest/call/duration/top/ten/' + auth_type + '/' + reqData.start_time + '/' +
        reqData.end_time + '/' + reqData.page_size + '/' + reqData.sort_field + '/' + reqData.sort_order;
    var Deferred = $.Deferred();
    callDurTopTenAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg,status) {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 获取通话数量和通话时长趋势图统计
let callCountAndDurAjax = null;
exports.getCallCountAndDur = function(reqData, reqBody) {
    callCountAndDurAjax && callCountAndDurAjax.abort();
    let url = '/rest/call/duration/count/' + reqData.start_time + '/' + reqData.end_time;
    var Deferred = $.Deferred();
    callCountAndDurAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg,status) {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//分别获取单个团队的通话趋势和通话时长
let callCountAndDurSeparatelyAjax = null;
exports.getCallCountAndDurSeparately = function(reqData, reqBody) {
    callCountAndDurSeparatelyAjax && callCountAndDurSeparatelyAjax.abort();
    let url = '/rest/call/duration/count/seperately/' + reqData.start_time + '/' + reqData.end_time;
    var Deferred = $.Deferred();
    callCountAndDurSeparatelyAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg,status) {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};


// 获取电话的接通情况
let getCallInfoAjax = null;
exports.getCallInfo = function(pathParam, reqData) {
    getCallInfoAjax && getCallInfoAjax.abort();
    var Deferred = $.Deferred();
    getCallInfoAjax = $.ajax({
        url: '/rest/call/info',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg,status) {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 114占比
let callRateAjax = {
    '114': null,
    'service': null
};
exports.getCallRate = function(reqData, reqBody, type) {
    callRateAjax[type] && callRateAjax[type].abort();
    var Deferred = $.Deferred();
    callRateAjax[type] = $.ajax({
        url: '/rest/call/rate/' + reqData.start_time + '/' + reqData.end_time,
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg,status) {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//获取通话时段（数量和时长）的统计数据
let callIntervalAjax = null;
exports.getCallIntervalData = function(authType, reqData) {
    callIntervalAjax && callIntervalAjax.abort();
    var Deferred = $.Deferred();
    callIntervalAjax = $.ajax({
        url: '/rest/call/interval_data/' + authType,
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//获取通话总次数、总时长Top10列表
let callTotalAjax = null;
exports.getCallTotalList = function(authType, reqData) {
    callTotalAjax && callTotalAjax.abort();
    var Deferred = $.Deferred();
    callTotalAjax = $.ajax({
        url: `/rest/call/total/count_time/${authType}`,
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 获取成员信息
exports.getSaleMemberList = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/sale/member/' + reqData.type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取通话客户的地域和阶段分布
let callZoneStageAjax = null;
exports.getCallCustomerZoneStage = function(authType, reqData) {
    callZoneStageAjax && callZoneStageAjax.abort();
    var Deferred = $.Deferred();
    callZoneStageAjax = $.ajax({
        url: `/rest/call/zone/stage/${authType}`,
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr, textStatus) => {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 获取订单阶段
exports.getSalesStageList = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_stage_list',
        dataType: 'json',
        type: 'get',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (errorMsg) => {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};