/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
//获取线索阶段分析列表
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
exports.getCustomerById = function(data) {
    var Deferred = $.Deferred();
    var pageSize = 10;
    $.ajax({
        url: '/rest/customer/range/' + pageSize + '/1' + 'start_time' + '/' + 'descend',
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('crm.detail.get.error', '获取客户详情失败'));
            }
        }
    });
    return Deferred.promise();
};
//获取线索统计列表
exports.getClueStatics = function(pathParams, rangeParams, queryParams) {
    var type = 'self';
    if (hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_ANALYSIS_LEAD_ALL)){
        type = 'all';
    }
    //销售取值时，query参数必须有，管理员可以没有
    if (type === 'self' && !queryParams){
        queryParams = {};
    }
    var data = {
        rangeParams: JSON.stringify(rangeParams),
        query: JSON.stringify(queryParams)
    };
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue/statics/' + type + '/' + pathParams.field + '/' + pathParams.page_size + '/' + pathParams.num,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('clue.statistic.get.error', '获取线索统计数据失败'));
        }
    });
    return Deferred.promise();
};
//获取线索趋势分析
exports.getClueTrendStatics = function(data) {
    var Deferred = $.Deferred();
    var type = 'self';
    if (hasPrivilege('CRM_CLUE_TREND_STATISTIC_ALL')){
        type = 'all';
    }
    $.ajax({
        url: '/rest/clue/trend/statics/' + type,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('clue.statistic.get.error', '获取线索统计数据失败'));
        }
    });
    return Deferred.promise();
};