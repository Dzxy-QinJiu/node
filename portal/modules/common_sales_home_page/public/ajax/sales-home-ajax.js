import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
import commonSalesHomePrivilegeConst from '../privilege-const';
//获取今日电话统计数据
var getPhoneTotalAjax;
exports.getPhoneTotal = function(reqData) {
    getPhoneTotalAjax && getPhoneTotalAjax.abort();
    var Deferred = $.Deferred();
    getPhoneTotalAjax = $.ajax({
        url: '/rest/commonsales/phone',
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
exports.activeUserEmail = function(bodyObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user_email/active',
        dataType: 'json',
        type: 'post',
        data: bodyObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取客户统计总数
var customerTotalAjax;
exports.getCustomerTotal = function(reqData) {
    customerTotalAjax && customerTotalAjax.abort();
    reqData = reqData || {};
    var Deferred = $.Deferred();
    customerTotalAjax = $.ajax({
        url: '/rest/analysis/customer/summary',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//查询最近联系的客户列表
var getTodayContactCustomerAjax = null;
exports.getTodayContactCustomer = function(rangParams, pageSize, sorter) {
    pageSize = pageSize || 10;
    sorter = sorter ? sorter : {field: 'id', order: 'ascend'};
    var Deferred = $.Deferred();
    var data = {
        rangParams: JSON.stringify(rangParams),
    };
    let type = 'user';
    if(hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL)){
        type = 'manager';
    }
    getTodayContactCustomerAjax = $.ajax({
        url: '/rest/contact_customer/' + type + '/' + pageSize + '/1/' + sorter.field + '/' + sorter.order,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('errorcode.61', '获取客户列表失败'));
            }
        }
    });
    return Deferred.promise();
};
//获取日程列表
var getTodayScheduleListAjax = null;
exports.getScheduleList = function(queryObj) {
    var Deferred = $.Deferred();
    getTodayScheduleListAjax = $.ajax({
        url: '/rest/get/schedule/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('errorcode.61', '获取客户列表失败'));
            }
        }
    });
    return Deferred.promise();
};
//最近登录的客户
const AUTHS = {
    'GETALL': crmPrivilegeConst.CUSTOMER_ALL,
    'UPDATE_ALL': crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL,
    'TRANSFER_MANAGER': crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
};
//最近登录的客户
exports.getRecentLoginCustomers = function(condition, rangParams, pageSize, pageNum, sorter) {
    pageSize = pageSize || 10;
    pageNum = pageNum || 1;
    sorter = sorter ? sorter : {field: 'id', order: 'ascend'};
    var data = {
        data: JSON.stringify(condition),
        rangParams: JSON.stringify(rangParams)
    };
    if (hasPrivilege(AUTHS.GETALL)) {
        data.hasManageAuth = true;
    }
    var Deferred = $.Deferred();

    $.ajax({
        url: '/rest/customer/range/' + pageSize + '/' + pageNum + '/' + sorter.field + '/' + sorter.order,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取系统通知
exports.getSystemNotices = function(queryObj, status) {
    var Deferred = $.Deferred();
    $.ajax({
        url: `/rest/notification/system/${status}`,
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON || Intl.get('notification.system.notice.failed', '获取系统消息列表失败'));
            }
        }
    });
    return Deferred.promise();
};

//获取重复的客户列表
exports.getRepeatCustomerList = function(queryParams) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/repeat_customer',
        dataType: 'json',
        type: 'get',
        data: queryParams,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取某个客户下的用户列表
let crmUserListAjax;
exports.getCrmUserList = function(reqData) {
    crmUserListAjax && crmUserListAjax.abort();
    let Deferred = $.Deferred();
    crmUserListAjax = $.ajax({
        url: '/rest/crm/user_list',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('user.list.get.failed', '获取用户列表失败'));
            }
        }
    });
    return Deferred.promise();
};

//获取到期或者即将到期的客户
exports.getExpireCustomer = function(data) {
    var Deferred = $.Deferred();
    //todo 待确认
    //普通销售，销售领导和舆情秘书用common，其他的用manager
    let type = hasPrivilege('KETAO_SALES_TEAM_WEEKLY_REPORTS_MANAGER') ? 'manager' : 'common';
    $.ajax({
        url: '/rest/get_expire_customer/' + type,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON || errorMsg.responseText);
        }
    });
    return Deferred.promise();
};
//系统消息
let handleSystemNoticeAjax;
exports.handleSystemNotice = function(noticeId) {
    if (handleSystemNoticeAjax) {
        handleSystemNoticeAjax.abort();
    }
    var Deferred = $.Deferred();
    handleSystemNoticeAjax = $.ajax({
        url: `/rest/notification/system/handle/${noticeId}`,
        dataType: 'json',
        type: 'put',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//修改某条日程管理的状态
exports.handleScheduleStatus = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/change/schedule/' + reqData.id + '/' + reqData.status,
        dataType: 'json',
        type: 'put',
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
/**
 * 获取新分配的客户
 * @param condition 用于存储查询时的过滤条件 数据格式 {}
 * @param rangeParams 用于存储查询的起止时间，以及根据哪个字段进行查询
 * {
 *  from: 0,
 *  to:  moment().valueOf(),
 *  type: "time",
 *  name: "allot_time"
 * }
 * @param pageSize 存储每页获取的数据数量 数字类型
 * @param sorter 根据某个字段进行排序及排序顺序
 * {
 *  field: "allot_time",
 *  order: "descend"
 *  };
 * @param queryObj 用于存储和下拉加载有关属性
 * {
 *  total_size: this.state.page_size,//这个接口是设计成翻页的，
 *  cursor: true,//前翻页还是后翻页
 *  allot_no_contact: "0" //分配后未联系
 *  }
 */
let getNewDistributeCustomerAjax;
exports.getNewDistributeCustomer = function(condition, rangParams, pageSize, pageNum, sorter) {
    if (getNewDistributeCustomerAjax) {
        getNewDistributeCustomerAjax.abort();
    }
    pageSize = pageSize || 20;
    pageNum = pageNum || 1;
    sorter = sorter ? sorter : {field: 'id', order: 'ascend'};
    var data = {
        data: JSON.stringify(condition),
        rangParams: JSON.stringify(rangParams)
    };
    if (hasPrivilege(AUTHS.GETALL)) {
        data.hasManageAuth = true;
    }
    var Deferred = $.Deferred();
    getNewDistributeCustomerAjax = $.ajax({
        url: '/rest/customer/range/' + pageSize + '/' + pageNum + '/' + sorter.field + '/' + sorter.order,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//查询线索客户
exports.getClueCustomerList = function(constObj, unexist_fields) {
    var sorter = constObj.sorterSalesClue;
    var data = {
        salesClueTypeFilter: JSON.stringify(constObj.salesClueTypeFilter),
        rangParams: JSON.stringify(constObj.rangParamsSalesClue),
    };
    //不存在的字段
    if (unexist_fields){
        data.unexist_fields = JSON.stringify(unexist_fields);
    }
    if (constObj.id){
        data.lastClueId = constObj.id;
    }
    var type = 'user';
    if (hasPrivilege(commonSalesHomePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL)){
        type = 'manager';
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/saleshome/v2/range/clue/' + type + '/' + constObj.page_size + '/' + sorter.field + '/' + sorter.order,
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//对网站进行个性化设置
var setWebSiteConfigAjax;
exports.setWebsiteConfig = function(queryObj) {
    var Deferred = $.Deferred();
    setWebSiteConfigAjax && setWebSiteConfigAjax.abort();
    setWebSiteConfigAjax = $.ajax({
        url: '/rest/setWebsiteConfig',
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取将要到期的合同
var getContractExpireRemind;
exports.getContractExpireRemind = function(reqData) {
    getContractExpireRemind && getContractExpireRemind.abort();
    var Deferred = $.Deferred();
    getContractExpireRemind = $.ajax({
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
