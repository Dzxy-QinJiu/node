/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/6/10.
 */
//获取线索跟踪记录列表
exports.getClueTraceList = function(queryObj, bodyData) {
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
            Deferred.reject(xhr.responseJSON || Intl.get('customer.fail.get.customer.trace', '获取{type}跟进记录列表失败',{type: Intl.get('crm.sales.clue', '线索')}));
        }
    });
    return Deferred.promise();
};


//增加线索跟进记录
exports.addClueTrace = function(queryObj) {
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
            Deferred.reject(xhr.responseJSON || Intl.get('customer.fail.add.customer.trace', '增加客户跟踪记录列表失败'));
        }
    });
    return Deferred.promise();

};
//更新线索跟进记录
exports.updateClueTrace = function(queryObj) {
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
            Deferred.reject(xhr.responseJSON || Intl.get('fail.add.customer.trace', '更新客户跟踪记录列表失败'));
        }
    });
    return Deferred.promise();

};
