/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2019/9/11.
 */
//保存线索分配策略
let saveClueAssignmentStrategyAjax = null;
exports.saveAssignmentStrategy = function(reqBody) {
    saveClueAssignmentStrategyAjax && saveClueAssignmentStrategyAjax.abort();
    let Deferred = $.Deferred();
    saveClueAssignmentStrategyAjax = $.ajax({
        url: '/rest/rule/sales_auto/lead',
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改线索分配策略
let editClueAssignmentStrategyAjax = null;
exports.editAssignmentStrategy = function(id, reqBody) {
    editClueAssignmentStrategyAjax && editClueAssignmentStrategyAjax.abort();
    let Deferred = $.Deferred();
    editClueAssignmentStrategyAjax = $.ajax({
        url: '/rest/rule/sales_auto/lead/' + id,
        dataType: 'json',
        type: 'put',
        data: reqBody,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除线索分配策略
let deleteClueAssignmentStrategyAjax = null;
exports.deleteAssignmentStrategy = function(id) {
    deleteClueAssignmentStrategyAjax && deleteClueAssignmentStrategyAjax.abort();
    let Deferred = $.Deferred();
    deleteClueAssignmentStrategyAjax = $.ajax({
        url: '/rest/rule/sales_auto/lead/' + id,
        dataType: 'json',
        type: 'delete',
        data: null,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取线索分配策略列表
let getClueAssignmentStrategiesAjax = null;
exports.getAssignmentStrategies = function(sort_id) {
    getClueAssignmentStrategiesAjax && getClueAssignmentStrategiesAjax.abort();
    let Deferred = $.Deferred();
    getClueAssignmentStrategiesAjax = $.ajax({
        url: '/rest/rule/sales_auto/lead/{:page_size}',
        dataType: 'json',
        type: 'post',
        data: sort_id,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};