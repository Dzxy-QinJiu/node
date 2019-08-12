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
//获取客户评分规则
exports.getCustomerScoreIndicator = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/score/indicator',
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
//保存客户的评分规则
exports.saveCustomerRules = (queryObj) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/save/customer/rules',
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (errorMsg) => {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};