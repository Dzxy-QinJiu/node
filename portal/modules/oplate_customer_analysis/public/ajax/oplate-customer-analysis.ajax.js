import ajax from '../../../common/ajax';
const routes = require('../../../common/route');
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
const AUTHS = {
    'GETALL': crmPrivilegeConst.CUSTOMER_ALL
};
//获取统计总数
var summaryNumbersAjax;
exports.getSummaryNumbers = function(reqData) {
    summaryNumbersAjax && summaryNumbersAjax.abort();
    reqData = reqData || {};
    var Deferred = $.Deferred();
    summaryNumbersAjax = $.ajax({
        url: '/rest/analysis/customer/summary',
        dataType: 'json',
        type: 'get',
        timeout: 180 * 1000,
        data: reqData,
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取具体统计数据
var analysisDataAjax = {};
exports.getAnalysisData = function(reqData) {
    analysisDataAjax[reqData.customerProperty] && analysisDataAjax[reqData.customerProperty].abort();
    reqData = reqData || {};
    var Deferred = $.Deferred();
    analysisDataAjax[reqData.customerProperty] = $.ajax({
        url: '/rest/analysis/customer/' + reqData.customerType + '/' + reqData.customerProperty,
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

exports.getUserType = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/group_position',
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

//获取销售阶段列表
exports.getSalesStageList = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_stage_list',
        dataType: 'json',
        type: 'get',
        success: function(list) {
            Deferred.resolve(list);
        }
    });
    return Deferred.promise();
};


//查询迁出客户
exports.getTransferCustomers = function(paramObj) {
    const handler = 'getTransferCustomers';
    const route = routes.find(x => x.handler === handler);

    return ajax({
        url: route.path,
        type: route.method,
        query: paramObj.query,
        params: paramObj.params
    });
};

//获取客户阶段变更数据
exports.getStageChangeCustomers = function(paramObj) {
    const handler = 'getStageChangeCustomers';
    const route = routes.find(x => x.handler === handler);
    //普通销售权限
    let type = 'self';
    if (hasPrivilege(AUTHS.GETALL)) {
        //管理员权限
        type = 'all';
    }
    return ajax({
        url: route.path,
        type: route.method,
        params: {
            data_type: type
        },
        query: paramObj
    });
};

//获取客户阶段变动的客户列表
exports.getStageChangeCustomerList = function(paramObj) {
    const handler = 'getStageChangeCustomerList';
    const route = routes.find(x => x.handler === handler);
    //普通销售权限
    let type = 'self';
    if (hasPrivilege(AUTHS.GETALL)) {
        //管理员权限
        type = 'all';
    }
    let queryObj = paramObj.queryObj;
    return ajax({
        url: route.path,
        type: route.method,
        params: {
            ...paramObj.params,
            type,
        },
        query: queryObj,
        data: paramObj
    });
};

//获取客户阶段变动的客户列表
exports.getIndustryCustomerOverlay = function(paramObj) {
    const handler = 'getIndustryCustomerOverlay';
    const route = routes.find(x => x.handler === handler);
    //普通销售权限
    let type = 'self';
    if (hasPrivilege(AUTHS.GETALL)) {
        //管理员权限
        type = 'all';
    }
    let queryObj = paramObj.queryObj;
    return ajax({
        url: route.path,
        type: route.method,
        params: {
            ...paramObj.params,
            type,
        },
        query: queryObj
    });
};

//获取销售新开客户数
exports.getNewCustomerCount = function(paramObj) {
    const handler = 'getNewCustomerCount';
    const route = routes.find(x => x.handler === handler);
    //普通销售权限
    let type = 'common';
    if (hasPrivilege(AUTHS.GETALL)) {
        //管理员权限
        type = 'manager';
    }
    let queryObj = paramObj.queryObj;
    return ajax({
        url: route.path,
        type: route.method,
        params: {
            ...paramObj.params,
            type,
        },
        query: queryObj
    });
};

