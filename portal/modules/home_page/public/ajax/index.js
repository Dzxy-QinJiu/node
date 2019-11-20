/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/21.
 */
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
//获取我的工作列表
let getMyWorkListAjax = null;
exports.getMyWorkList = function(queryParams) {
    var Deferred = $.Deferred();
    getMyWorkListAjax && getMyWorkListAjax.abort();
    getMyWorkListAjax = $.ajax({
        url: '/rest/home_page/my_works',
        dataType: 'json',
        type: 'get',
        data: queryParams,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error) {
            Deferred.reject(error.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取我的工作类型列表
let getMyWorkTypesAjax = null;
exports.getMyWorkTypes = function() {
    var Deferred = $.Deferred();
    getMyWorkTypesAjax && getMyWorkTypesAjax.abort();
    getMyWorkTypesAjax = $.ajax({
        url: '/rest/home_page/my_work_types',
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error) {
            Deferred.reject(error.responseJSON);
        }
    });
    return Deferred.promise();
};

//将我的某个工作设为已处理
exports.handleMyWorkStatus = function(bodyObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/home_page/my_work/status',
        dataType: 'json',
        type: 'put',
        data: bodyObj,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error) {
            Deferred.reject(error.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取业绩排名
let getContractPerformanceAjax = null;
exports.getContractPerformance = function(queryParams) {
    let type = 'self';//CRM_CONTRACT_SALES_REPORTS_COMMON
    if (hasPrivilege(analysisPrivilegeConst.CRM_CONTRACT_SALES_REPORTS_MANAGER)) {
        type = 'all';
    }
    var Deferred = $.Deferred();
    getContractPerformanceAjax && getContractPerformanceAjax.abort();
    getContractPerformanceAjax = $.ajax({
        url: `/rest/contract/performance/${type}`,
        dataType: 'json',
        type: 'get',
        data: queryParams,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error) {
            Deferred.reject(error.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取通话时长数据
let getCallTimeDataAjax = null;
exports.getCallTimeData = function(reqData) {
    var Deferred = $.Deferred();
    getCallTimeDataAjax && getCallTimeDataAjax.abort();
    getCallTimeDataAjax = $.ajax({
        url: '/rest/call/time/data',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};


//获取本周联系过的客户数
let getContactCustomerCountAjax = null;
exports.getContactCustomerCount = function(reqData) {
    let type = 'user';//CRM_LIST_CUSTOMERS
    if (hasPrivilege('CUSTOMER_ALL')) {
        type = 'manager';
    }
    var Deferred = $.Deferred();
    getContactCustomerCountAjax && getContactCustomerCountAjax.abort();
    getContactCustomerCountAjax = $.ajax({
        url: '/rest/contact/customer/count/' + type,
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取我关注的数据
let getMyInterestDataAjax = null;
exports.getMyInterestData = function(reqData) {
    var Deferred = $.Deferred();
    getMyInterestDataAjax && getMyInterestDataAjax.abort();
    getMyInterestDataAjax = $.ajax({
        url: '/rest/home_page/my_insterest',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//修改我关注数据的状态
exports.updateMyInterestStatus = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/home_page/my_insterest/status',
        dataType: 'json',
        type: 'put',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取过期合同数据
let getExpireContractAjax = null;
exports.getExpireContractData = function(reqData) {
    var Deferred = $.Deferred();
    getExpireContractAjax && getExpireContractAjax.abort();
    $.ajax({
        url: '/rest/analysis/contract/contract/total/count/expired',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
