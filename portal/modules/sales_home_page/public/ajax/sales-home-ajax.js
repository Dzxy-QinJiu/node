import {hasPrivilege} from "CMP_DIR/privilege/checker";
//获取今日电话统计数据
var getphoneTotalAjax;
exports.getphoneTotal = function (reqData, type) {
    getphoneTotalAjax && getphoneTotalAjax.abort();
    var Deferred = $.Deferred();
    getphoneTotalAjax = $.ajax({
        url: '/rest/sales/phone/' + type,
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取客户统计总数
var customerTotalAjax;
exports.getCustomerTotal = function (reqData) {
    customerTotalAjax && customerTotalAjax.abort();
    reqData = reqData || {};
    var Deferred = $.Deferred();
    customerTotalAjax = $.ajax({
        url: '/rest/analysis/customer/summary',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
/**
 * 过期用户列表
 */
exports.getExpireUser = function (queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/expireuser',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get("sales.home.get.expired.list.failed", "获取过期用户列表失败!"));
            }
        }
    });
    return Deferred.promise();
};
//查询最近联系的客户列表
var getTodayContactCustomerAjax = null;
exports.getTodayContactCustomer = function (rangParams, pageSize, sorter) {
    pageSize = pageSize || 10;
    sorter = sorter ? sorter : {field: "id", order: "ascend"};
    var Deferred = $.Deferred();
    var data = {
        rangParams: JSON.stringify(rangParams),
    };
    getTodayContactCustomerAjax = $.ajax({
        url: '/rest/contact_customer/' + pageSize + "/" + sorter.field + "/" + sorter.order,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get("errorcode.61", "获取客户列表失败"));
            }
        }
    });
    return Deferred.promise();
};
//获取日程列表
var getTodayScheduleListAjax = null;
exports.getScheduleList = function (queryObj) {
    var Deferred = $.Deferred();
    getTodayScheduleListAjax = $.ajax({
        url: '/rest/get/schedule/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get("errorcode.61", "获取客户列表失败"));
            }
        }
    });
    return Deferred.promise();
};
//最近登录的客户
const AUTHS = {
    "GETALL": "CUSTOMER_ALL",
    "UPDATE_ALL": "CUSTOMER_MANAGER_UPDATE_ALL",
    "TRANSFER_MANAGER": "CRM_MANAGER_TRANSFER"
};
//最近登录的客户
exports.getRecentLoginCustomers = function (condition, rangParams, pageSize, sorter, queryObj) {
    pageSize = pageSize || 10;
    sorter = sorter ? sorter : {field: "id", order: "ascend"};
    var data = {
        data: JSON.stringify(condition),
        rangParams: JSON.stringify(rangParams),
        queryObj: JSON.stringify(queryObj)
    };
    if (hasPrivilege(AUTHS.GETALL)) {
        data.hasManageAuth = true;
    }
    var Deferred = $.Deferred();

    $.ajax({
        url: '/rest/customer/v2/customer/range/' + pageSize + "/" + sorter.field + "/" + sorter.order,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取系统通知
exports.getSystemNotices = function (queryObj, status) {
    var Deferred = $.Deferred();
    $.ajax({
        url: `/rest/notification/system/${status}`,
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON || Intl.get("notification.system.notice.failed", "获取系统消息列表失败"));
            }
        }
    });
    return Deferred.promise();
};

//获取重复的客户列表
exports.getRepeatCustomerList = function (queryParams) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/repeat_customer',
        dataType: 'json',
        type: 'get',
        data: queryParams,
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取某个客户下的用户列表
let crmUserListAjax;
exports.getCrmUserList = function (reqData) {
    crmUserListAjax && crmUserListAjax.abort();
    let Deferred = $.Deferred();
    crmUserListAjax = $.ajax({
        url: '/rest/crm/user_list',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get("user.list.get.failed", "获取用户列表失败"));
            }
        }
    });
    return Deferred.promise();
};

//获取即将到期的客户
exports.getWillExpireCustomer = function (data) {
    var Deferred = $.Deferred();
    //普通销售，销售领导和舆情秘书用common，其他的用manager
    let type = hasPrivilege("KETAO_SALES_TEAM_WEEKLY_REPORTS_COMMON") ? "common" : "manager";
    $.ajax({
        url: '/rest/get_will_expire_customer/' + type,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON || errorMsg.responseText);
        }
    });
    return Deferred.promise();
};
//系统消息
let handleSystemNoticeAjax;
exports.handleSystemNotice = function (noticeId) {
    if (handleSystemNoticeAjax) {
        handleSystemNoticeAjax.abort();
    }
    var Deferred = $.Deferred();
    handleSystemNoticeAjax = $.ajax({
        url: `/rest/notification/system/handle/${noticeId}`,
        dataType: 'json',
        type: 'put',
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//修改某条日程管理的状态
exports.handleScheduleStatus = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/change/schedule/' + reqData.id + '/' + reqData.status,
        dataType: 'json',
        type: 'put',
        success: function (resData) {
            Deferred.resolve(resData);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取新分配的客户
let getNewDistributeCustomerAjax;
exports.getNewDistributeCustomer = function (data) {
    if (getNewDistributeCustomerAjax) {
        getNewDistributeCustomerAjax.abort();
    }
    var Deferred = $.Deferred();
    getNewDistributeCustomerAjax = $.ajax({
        url: '/rest/get_new_distribute_customer',
        dataType: 'json',
        type: 'post',
        data: data,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON);
            }
        }
    });
    return Deferred.promise();
};