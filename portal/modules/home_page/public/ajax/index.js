/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/21.
 */

//获取我的工作列表
let getMyWorkListAjax = null;
exports.getMyWorkList = function(queryParams) {
    var Deferred = $.Deferred();
    getMyWorkListAjax && getMyWorkListAjax.abort();
    getMyWorkListAjax = $.ajax({
        url: '/rest/home_page/my_works',
        dataType: 'json',
        type: 'get',
        data: queryParams,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error) {
            Deferred.reject(error.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取我的工作类型列表
let getMyWorkTypesAjax = null;
exports.getMyWorkTypes = function() {
    var Deferred = $.Deferred();
    getMyWorkTypesAjax && getMyWorkTypesAjax.abort();
    getMyWorkTypesAjax = $.ajax({
        url: '/rest/home_page/my_work_types ',
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error) {
            Deferred.reject(error.responseJSON);
        }
    });
    return Deferred.promise();
};