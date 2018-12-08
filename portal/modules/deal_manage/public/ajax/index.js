/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
const AUTHS = {
    MANAGER_DEAL_LIST: 'CRM_MANAGER_LIST_SALESOPPORTUNITY',
};
//获取订单列表
exports.getDealList = function(params, body, query) {
    //权限与路径的处理
    let type = 'user';
    if (hasPrivilege(AUTHS.MANAGER_DEAL_LIST)) {
        type = 'manager';
    }
    //params路径参数的处理
    let url = `/rest/deal/${type}/${params.page_size}/${params.sort_field}/${params.sort_order}`;
    //query参数的处理
    let isFirstKey = true;
    _.each(query, (value, key) => {
        //第一个key前面需要加?
        if (isFirstKey) {
            isFirstKey = false;
            url += `?${key}=${value}`;
        } else {
            url += `&${key}=${value}`;
        }
    });
    let Deferred = $.Deferred();
    $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: body,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//修改订单
exports.editDeal = function(saveObj) {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/deal',
        dataType: 'json',
        type: 'put',
        data: saveObj,
        success: result => {
            Deferred.resolve(result);
        },
        error: xhr => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除订单
exports.deleteDeal = function(deal_id) {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/deal/${deal_id}`,
        dataType: 'json',
        type: 'delete',
        success: result => {
            Deferred.resolve(result);
        },
        error: xhr => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};