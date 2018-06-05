/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
//获取线索统计列表
exports.getClueAnalysis = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue/analysis',
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
exports.getCustomerById = function(data) {
    var Deferred = $.Deferred();
    var pageSize = 10;
    $.ajax({
        url: '/rest/customer/v2/customer/range/' + pageSize + '/' + 'start_time' + '/' + 'descend',
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