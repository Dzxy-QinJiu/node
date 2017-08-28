/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
// 获取用户详情变更记录
var userAbnormalLoginAjax = null;
exports.getUserAbnormalLogin = function(data){
    var Deferred = $.Deferred();
    userAbnormalLoginAjax && userAbnormalLoginAjax.abort();
    userAbnormalLoginAjax = $.ajax({
        url: '/rest/user/abnormal_login',
        type: 'get',
        data: data,
        dateType: 'json',
        success : function(data){
            Deferred.resolve(data);
        },
        error: function (xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};