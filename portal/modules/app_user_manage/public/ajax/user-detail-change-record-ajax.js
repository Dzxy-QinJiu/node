/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */

// 获取用户详情变更记录
var userDetailChangeRecordAjax = null;
exports.getUserDetailChangeRecord = function(searchObj){
    var Deferred = $.Deferred();
    userDetailChangeRecordAjax && userDetailChangeRecordAjax.abort();
    userDetailChangeRecordAjax = $.ajax({
        url: '/rest/user/record',
        type: 'get',
        data: searchObj,
        dateType: 'json',
        success: function(data){
            Deferred.resolve(data);
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};