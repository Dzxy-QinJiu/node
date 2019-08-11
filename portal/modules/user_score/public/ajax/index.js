/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/5.
 */
exports.getUserScoreIndicator = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/score/indicator',
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
exports.getUserEngagementRule = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/user/engagement/rule',
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
exports.saveUserEngagementRule = (queryObj) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/save/user/engagement/rule',
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
exports.getUserScoreLists = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/user/score/rules',
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
exports.saveUserScoreLists = (queryObj) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/save/user/score/rules',
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