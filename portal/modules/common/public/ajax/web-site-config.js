/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/6.
 */
let getWebsiteConfigAjax = null;
exports.getWebsiteConfig = function(queryObj) {
    var Deferred = $.Deferred();
    getWebsiteConfigAjax && getWebsiteConfigAjax.abort();
    getWebsiteConfigAjax = $.ajax({
        url: '/get/user/website/config',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};