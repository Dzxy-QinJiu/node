import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import querystring from 'querystring';
let teamAjax = require('../../../common/public/ajax/team');
import call_record_privilegeConst from '../../../call_record/public/privilege-const';
/**
 * 获取销售是什么角色
 * 普通销售：sales
 * 基层领导：salesleader
 * 高层领导：salesseniorleader
 * 舆情秘书：salesmanager
 * @param callback
 */
exports.getSalesType = function() {
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

//获取统计团队内成员个数的列表
let teamMemberCountAjax;
exports.getTeamMemberCountList = function() {
    teamMemberCountAjax && teamMemberCountAjax.abort();
    let Deferred = $.Deferred();
    teamMemberCountAjax = teamAjax.getTeamMemberCountListAjax().sendRequest()
        .success(list => {
            Deferred.resolve(list);
        }).error(error => {
            Deferred.resolve(error.responseText);
        });
    return Deferred.promise();
};
//获取销售对应的通话状态
let salesCallStatusAjax;
exports.getSalesCallStatus = function(userIds) {
    salesCallStatusAjax && salesCallStatusAjax.abort();
    var Deferred = $.Deferred();
    salesCallStatusAjax = $.ajax({
        url: '/rest/sales/call_status',
        dataType: 'json',
        type: 'get',
        data: {user_ids: userIds},
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
//获取某销售团队成员列表
var salesTeamMembersAjax;
exports.getSalesTeamMembers = function(teamId) {
    salesTeamMembersAjax && salesTeamMembersAjax.abort();
    var Deferred = $.Deferred();
    salesTeamMembersAjax = teamAjax.getMemberListByTeamIdAjax().resolvePath({
        group_id: teamId
    }).sendRequest({
        filter_manager: true,//过滤掉舆情秘书
        with_teamrole: true
    }).success(function(list) {
        Deferred.resolve(list);
    }).error(function(xhr, statusText) {
        if (statusText !== 'abort') {
            Deferred.reject(xhr.responseJSON);
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

//获取用户统计总数
var userTotalAjax;
exports.getUserTotal = function(reqData) {
    userTotalAjax && userTotalAjax.abort();
    reqData = reqData || {};
    var Deferred = $.Deferred();
    userTotalAjax = $.ajax({
        url: '/rest/analysis/user/summary',
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

//获取销售-客户列表
exports.getSalesCustomerList = function(timeRange) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/customer',
        dataType: 'json',
        type: 'get',
        data: {start_time: new Date(timeRange.start_time), end_time: new Date(timeRange.end_time)},
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取销售-电话列表
exports.getSalesPhoneList = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/phone',
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
//获取销售-用户列表
exports.getSalesUserList = function(timeRange) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/user',
        dataType: 'json',
        type: 'get',
        data: {start_time: new Date(timeRange.start_time), end_time: new Date(timeRange.end_time)},
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取销售-合同列表
exports.getSalesContractList = function(timeRange) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales/contract',
        dataType: 'json',
        type: 'get',
        data: {start_time: new Date(timeRange.start_time), end_time: new Date(timeRange.end_time)},
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

/**
 * 过期用户列表
 */
exports.getExpireUser = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/expireuser',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('sales.home.get.expired.list.failed', '获取过期用户列表失败!'));
            }
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

//获取回访列表
let getCallBackAjax = null;
exports.getCallBackList = function(paramsObj, filterObj) {
    let Deferred = $.Deferred();
    let queryObj = {};
    $.extend(queryObj, filterObj, { phone_type: paramsObj.query.phone_type });
    getCallBackAjax && getCallBackAjax.abort();
    const queryCustomer = paramsObj.query.phone_type === 'customer'; // 客户电话的类型过滤
    let filter_phone = queryCustomer; // 是否过滤114和无效的电话号码
    let auth_type = hasPrivilege(call_record_privilegeConst.CURTAO_CRM_TRACE_QUERY_ALL) ? 'manager/' : 'user/';
    let url = '/rest/call_record/' + auth_type;
    var paramsArray = Object.keys(paramsObj.params).map(function(key) {
        return paramsObj.params[key];
    });
    url += paramsArray.join('/');
    url += '?';
    if (paramsObj.query.lastId) {
        url += querystring.stringify({id: paramsObj.query.lastId, filter_phone: queryCustomer}); // 是否过滤114和无效的电话号码(客户电话需要过滤)
    } else {
        url += querystring.stringify({filter_phone: queryCustomer}); // 是否过滤114和无效的电话号码(客户电话需要过滤)
    }
    getCallBackAjax = $.ajax({
        url,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//通过或者驳回申请
let approveMemberApplyPassOrRejectAjax = null;
exports.approveMemberApplyPassOrReject = (obj) => {
    let Deferred = $.Deferred();
    approveMemberApplyPassOrRejectAjax && approveMemberApplyPassOrRejectAjax.abort();
    approveMemberApplyPassOrRejectAjax = $.ajax({
        url: '/rest/member_apply/apply',
        dataType: 'json',
        type: 'post',
        data: obj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (errorMsg) => {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
