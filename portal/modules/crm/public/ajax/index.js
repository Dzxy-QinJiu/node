const hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;
const AUTHS = {
    "GETALL": "CUSTOMER_ALL",
    "UPDATE_ALL": "CUSTOMER_MANAGER_UPDATE_ALL",
    "TRANSFER_MANAGER": "CRM_MANAGER_TRANSFER"
};
//添加客户
exports.addCustomer = function (newCus) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/add_customer',
        dataType: 'json',
        type: 'post',
        data: newCus,
        success: function (added) {
            Deferred.resolve(added);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除客户
exports.deleteCustomer = function (ids) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/delete_customer',
        dataType: 'json',
        type: 'delete',
        data: {ids: JSON.stringify(ids)},
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//更新客户
exports.updateCustomer = function (newCus) {
    if (hasPrivilege(AUTHS.UPDATE_ALL)) {
        newCus.urlType = "manager";
    } else {
        newCus.urlType = "user";
    }
    if (!newCus.type) {
        let keys = _.keys(newCus);
        if (keys.indexOf("administrative_level") != -1) {
            newCus.type = "administrative_level";
        } else if (keys.indexOf("address") != -1) {
            newCus.id = newCus.user_id;
            delete newCus.user_id;
            newCus.type = "detail_address";
        }
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/update_customer',
        dataType: 'json',
        type: 'put',
        data: {newCus: JSON.stringify(newCus)},
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//转出客户
exports.transferCustomer = function (customer) {
    let urlType = "user";// CRM_USER_TRANSFER
    if (hasPrivilege(AUTHS.TRANSFER_MANAGER)) {
        urlType = "manager";
    }
    delete customer.type;
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/:type/transfer_customer'.replace(":type", urlType),
        dataType: 'json',
        type: 'put',
        data: customer,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
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

//通过重复客户的id获取重复的客户列表
exports.getRepeatCustomersById = function (customerId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: `/rest/crm/repeat_customer/${customerId}`,
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//根据客户id获取客户信息
exports.getCustomerById = function (customerId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/customer/' + customerId,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//查询客户
exports.queryCustomer = function (condition, rangParams, pageSize, sorter, queryObj) {
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

//获取当前页要展示的动态列表
exports.getDynamicList = function (customer_id) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm_dynamic/' + customer_id,
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.delRepeatCustomer = function (customerIdArray) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/repeat_customer/delete',
        dataType: 'json',
        type: 'put',
        data: {ids: JSON.stringify(customerIdArray)},
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.mergeRepeatCustomer = function (mergeObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/repeat_customer/merge',
        dataType: 'json',
        type: 'put',
        data: {customer: JSON.stringify(mergeObj.customer), delete_ids: JSON.stringify(mergeObj.delete_ids)},
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.checkOnlyCustomer = function (queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/customer_only/check',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取后台管理中配置的行业列表
exports.getIndustries = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/industries',
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

//根据客户名获取行政级别
exports.getAdministrativeLevel = function (queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/administrative_level',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 拨打电话
exports.callOut = function (reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/call/out',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取电话座机号
exports.getUserPhoneNumber = function (member_id) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/call/phone/' + member_id,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
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
//获取所在团队及下级团队列表
let salesTeamListAjax;
exports.getMyTeamWithSubteams = function () {
    let type = "self";//GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS
    if (hasPrivilege("GET_TEAM_LIST_ALL")) {
        type = "all";
    }
    salesTeamListAjax && salesTeamListAjax.abort();
    let Deferred = $.Deferred();
    $.ajax({
        url: "/rest/crm/sales_team_tree",
        dataType: 'json',
        type: 'get',
        data: {type: type},
        success: function (treeList) {
            Deferred.resolve(treeList);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};