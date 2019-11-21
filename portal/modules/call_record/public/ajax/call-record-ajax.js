import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import call_record_privilegeConst from '../privilege-const';
//获取当前页的应用列表
var getCallRecordAjax = null;

exports.getCallRecordList = function(params, filterObj) {
    let queryObj = {};
    $.extend(queryObj, filterObj, { phone_type: params.phone_type });
    if (queryObj.disposition && queryObj.disposition == 'ALL') {
        delete queryObj.disposition;
    }
    var Deferred = $.Deferred();
    getCallRecordAjax && getCallRecordAjax.abort();
    const querAll = params.phone_type === 'all';
    const queryCustomer = params.phone_type === 'customer';//客户电话的类型过滤
    let url = '';
    //查询全部和客户电话记录
    if (querAll || queryCustomer) {
        let filter_phone = queryCustomer;//是否过滤114和无效的电话号码
        let auth_type = hasPrivilege('CUSTOMER_CALLRECORD_MANAGER_ONLY') ? 'manager' : 'user';
        url = '/rest/call_record/' + auth_type + '/' + params.start_time + '/' + params.end_time + '/' + params.page_size + '/' + params.sort_field + '/' + params.sort_order;
        if (params.lastId) {
            url += '?id=' + params.lastId;            
            url += '&filter_phone=' + queryCustomer; //是否过滤114和无效的电话号码(客户电话需要过滤)
        }
        else {
            url += '?filter_phone=' + queryCustomer; //是否过滤114和无效的电话号码(客户电话需要过滤)
        }
    }
    //查询无效电话记录
    else {
        //角色类型
        let type = hasPrivilege(call_record_privilegeConst.CURTAO_CRM_TRACE_QUERY_ALL) ? 'manager' : 'user';
        url = '/rest/invalid_call_record/' + type + '/' + params.start_time + '/' + params.end_time + '/' + params.page_size + '/' + params.sort_field + '/' + params.sort_order;
        if (params.lastId) {
            url += '?id=' + params.lastId;
            url += '&phone_type=' + params.phone_type;
        }
        else {
            url += '?phone_type=' + params.phone_type;
        }
    }
    getCallRecordAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function(appList) {
            Deferred.resolve(appList);
        },
        error: function(xhr, textStatus) {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 编辑通话记录中跟进内容
exports.editCallTraceContent = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/call/edit/content',
        dataType: 'json',
        type: 'put',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 搜索电话号码号码时，提供推荐列表
exports.getRecommendPhoneList = function(params, queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/call/search/phone_number/' + params.filter_phone,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};