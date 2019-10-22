/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
//获取客户跟踪记录列表
exports.getCustomerTraceRecordList = function(queryObj, bodyData) {
    var Deferred = $.Deferred();
    let url = '/rest/customer/get_customer_trace_list';
    let isFirst = true;
    _.each(queryObj, (value, key) => {
        if (isFirst) {
            url += `?${key}=${value}`;
            isFirst = false;
        } else {
            url += `&${key}=${value}`;
        }
    });
    $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: bodyData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('customer.fail.get.customer.trace', '获取{type}跟进记录列表失败',{type: Intl.get('call.record.customer', '客户')}));
        }
    });
    return Deferred.promise();
};

//获取某组织内跟进记录的类型（除去固定的电话、拜访、其他以外的类型）
exports.getExtraTraceType = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/trace_type',
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取跟进记录的分类统计
exports.getCustomerTraceStatistic = function(queryParams) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/trace/statistic',
        dataType: 'json',
        type: 'get',
        data: queryParams,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('clue.fail.customer.trace.statics', '获取跟进记录的分类统计失败'));
        }
    });
    return Deferred.promise();
};

//增加客户跟踪记录
exports.addCustomerTrace = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/add_customer_trace_list',
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('customer.fail.add.customer.trace', '添加跟进记录失败'));
        }
    });
    return Deferred.promise();

};
//更新客户跟踪记录
exports.updateCustomerTrace = function(queryObj) {

    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/update_customer_trace_list',
        dataType: 'json',
        type: 'put',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('fail.add.customer.trace', '更新跟进记录失败'));
        }
    });
    return Deferred.promise();

};
