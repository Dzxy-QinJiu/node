/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/28.
 */
//获取客户标签
let getCustomerLabelAjax = null;
exports.getCustomerLabel = function(reqData) {
    var Deferred = $.Deferred();
    getCustomerLabelAjax && getCustomerLabelAjax.abort();
    getCustomerLabelAjax = $.ajax({
        url: '/rest/cpr/customer_label/' + reqData.type,
        dataType: 'json',
        type: 'post',
        data: {},
        success: function(added) {
            Deferred.resolve(added);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//根据团队获取客户阶段
exports.getCustomerStageByTeamId = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/cpr/customer_stage/' + reqData.team_id,
        dataType: 'json',
        type: 'get',
        data: {},
        success: function(added) {
            Deferred.resolve(added);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取客户池配置
exports.getCustomerPoolConfigs = function(queryObj) {
    let url = '/rest/cpr/configs';
    let isFirst = true;
    _.each(queryObj, (value, key) => {
        if (isFirst) {
            url += `?${key}=${value}`;
            isFirst = false;
        } else {
            url += `&${key}=${value}`;
        }
    });
    var Deferred = $.Deferred();
    $.ajax({
        url,
        dataType: 'json',
        type: 'get',
        data: {},
        success: function(added) {
            Deferred.resolve(added);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//添加客户池配置
let addCustomerPoolConfigAjax = null;
exports.addCustomerPoolConfig = function(reqData) {
    var Deferred = $.Deferred();
    addCustomerPoolConfigAjax && addCustomerPoolConfigAjax.abort();
    addCustomerPoolConfigAjax = $.ajax({
        url: '/rest/cpr/config',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(added) {
            Deferred.resolve(added);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//更新客户池配置
let updateCustomerPoolConfigAjax = null;
exports.updateCustomerPoolConfig = function(reqData) {
    var Deferred = $.Deferred();
    updateCustomerPoolConfigAjax && updateCustomerPoolConfigAjax.abort();
    updateCustomerPoolConfigAjax = $.ajax({
        url: '/rest/cpr/config',
        dataType: 'json',
        type: 'put',
        data: reqData,
        success: function(added) {
            Deferred.resolve(added);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除客户池配置
let deleteCustomerPoolConfigAjax = null;
exports.deleteCustomerPoolConfig = function(reqData) {
    var Deferred = $.Deferred();
    deleteCustomerPoolConfigAjax && deleteCustomerPoolConfigAjax.abort();
    deleteCustomerPoolConfigAjax = $.ajax({
        url: '/rest/cpr/config/' + reqData.id,
        dataType: 'json',
        type: 'delete',
        data: {},
        success: function(added) {
            Deferred.resolve(added);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};


