/**
 * Copyright (c) 2019-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2019-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/23.
 */
//获取个人线索推荐保存配置
exports.getSettingCustomerRecomment = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue/recommend/condition',
        dataType: 'json',
        type: 'get',
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//添加和修改个人线索推荐保存配置
var addOrEditSettingCustomerRecommentAjax = null;
exports.addOrEditSettingCustomerRecomment = function(data) {
    var Deferred = $.Deferred();
    addOrEditSettingCustomerRecommentAjax && addOrEditSettingCustomerRecommentAjax.abort();
    addOrEditSettingCustomerRecommentAjax = $.ajax({
        url: '/rest/clue/recommend/condition',
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//获取线索的推荐列表
var getRecommendClueListsAjax = null;
exports.getRecommendClueLists = function(obj) {
    let load_size = _.get(obj, 'load_size', 20);
    delete obj.load_size;
    var Deferred = $.Deferred();
    getRecommendClueListsAjax && getRecommendClueListsAjax.abort();
    getRecommendClueListsAjax = $.ajax({
        url: '/rest/clue/recommend/lists?load_size=' + load_size,
        dataType: 'json',
        type: 'post',
        data: {reqData: JSON.stringify(obj)},
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//根据公司名获取联想列表
let getCompanyListByNameAjax = null;
exports.getCompanyListByName = function(queryObj) {
    var Deferred = $.Deferred();
    getCompanyListByNameAjax && getCompanyListByNameAjax.abort();
    getCompanyListByNameAjax = $.ajax({
        url: '/rest/recommend/clue/company/name',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, errorText) {
            if(errorText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//获取该线索是否被提取
let getRecommendCluePickedAjax = null;
exports.getRecommendCluePicked = function(queryObj) {
    var Deferred = $.Deferred();
    getRecommendCluePickedAjax && getRecommendCluePickedAjax.abort();
    getRecommendCluePickedAjax = $.ajax({
        url: '/rest/recommend/clue/picked',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, errorText) {
            if(errorText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};