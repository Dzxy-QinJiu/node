/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/1.
 */

//获取客户分数等级
exports.getCustomerScoreRules = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/score/rules',
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
exports.getCustomerScoreLevel = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/score/level',
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