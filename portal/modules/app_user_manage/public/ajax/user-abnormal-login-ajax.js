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
        success: function(data){
            Deferred.resolve(data);
        },
        error: function(xhr,status) {
            if(status !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.login.abnormal.get.failed', '获取异常登录信息失败'));
            }
        }
    });
    return Deferred.promise();
};

// 忽略异常登录地
let ignoreAbnormalLoginAjax = null;
exports.ignoreAbnormalLogin = function(id) {
    let Deferred = $.Deferred();
    ignoreAbnormalLoginAjax && ignoreAbnormalLoginAjax.abort();
    ignoreAbnormalLoginAjax = $.ajax({
        url: '/rest/user/abnormal/ignore',
        dataType: 'json',
        type: 'post',
        data: { id: id },
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr,status) => {
            if( status !== 'abort' ){
                Deferred.reject(xhr.responseJSON || Intl.get('user.login.abnormal.failed', '忽略异常登录地失败！'));
            }
        }
    });
    return Deferred.promise();
};
