/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
import {hasPrivilege, getDataAuthType} from 'CMP_DIR/privilege/checker';
import orderPrivilege from '../privilege-const';
import analysisPrivilegeConst from '../../../analysis/public/privilege-const';
const AUTHS = {
    MANAGER_DEAL_LIST: orderPrivilege.CRM_MANAGER_LIST_SALESOPPORTUNITY,
};
//获取订单列表
exports.getDealList = function(params, body) {
    //权限与路径的处理
    let type = 'user';
    if (hasPrivilege(AUTHS.MANAGER_DEAL_LIST)) {
        type = 'manager';
    }
    //params路径参数的处理
    let url = `/rest/deal/${type}/${params.page_size}/${params.page_num}/${params.sort_field}/${params.sort_order}`;
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

//各阶段总预算的获取
exports.getStageTotalBudget = function(query) {
    // let type = getDataAuthType().toLowerCase();
    let type = 'common';//CURTAO_CRM_CUSTOMER_ANALYSIS_SELF
    if(hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL)) {
        type = 'manager';
    }
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/deal/${type}/stage/total_budget`,
        dataType: 'json',
        type: 'get',
        data: query,
        success: result => {
            Deferred.resolve(result);
        },
        error: xhr => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};