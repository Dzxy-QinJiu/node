/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
//查询日程列表
exports.getScheduleList = function (queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/schedule/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//修改某条日程管理的状态
exports.handleScheduleStatus = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/change/schedule/' + reqData.id + '/' + reqData.status,
        dataType: 'json',
        type: 'put',
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};