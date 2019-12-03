const hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
import crmPrivilegeConst from '../privilege-const';
//添加客户
let addCustomerAjax = null;
exports.addCustomer = function(newCus) {
    var Deferred = $.Deferred();
    addCustomerAjax && addCustomerAjax.abort();
    addCustomerAjax = $.ajax({
        url: '/rest/crm/add_customer',
        dataType: 'json',
        type: 'post',
        data: newCus,
        success: function(added) {
            Deferred.resolve(added);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//联合跟进人的修改
let editSecondSalesAjax = null;
exports.editSecondSales = function(submitObj) {
    var Deferred = $.Deferred();
    editSecondSalesAjax && editSecondSalesAjax.abort();
    editSecondSalesAjax = $.ajax({
        url: '/rest/crm/second_sales',
        dataType: 'json',
        type: 'put',
        data: submitObj,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//通过线索添加客户
let addCustomerByClueAjax = null;
exports.addCustomerByClue = function(newCus, isConvert) {
    var reqBody = _.cloneDeep(newCus);
    var clueId = newCus.clue_id;
    delete reqBody.clue_id;
    var Deferred = $.Deferred();
    addCustomerByClueAjax && addCustomerByClueAjax.abort();
    addCustomerByClueAjax = $.ajax({
        url: '/rest/crm/add_customer_by_clue' + `?clueId=${clueId}&is_convert=${isConvert}`,
        dataType: 'json',
        type: 'post',
        data: reqBody,
        success: function(added) {
            Deferred.resolve(added);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除客户
exports.deleteCustomer = function(id) {
    var Deferred = $.Deferred();
    $.ajax({
        url: `/rest/crm/delete_customer/${id}`,
        dataType: 'json',
        type: 'delete',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//更新客户（单项修改）
exports.updateCustomer = function(newCus) {
    if (hasPrivilege(crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL)) {
        newCus.urlType = 'manager';
    } else {
        newCus.urlType = 'user';
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/update_customer',
        dataType: 'json',
        type: 'put',
        data: {newCus: JSON.stringify(newCus)},
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//转出客户
exports.transferCustomer = function(customer) {
    let urlType = 'user';// crmPrivilegeConst.CUSTOMER_UPDATE
    if (hasPrivilege(crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL)) {
        urlType = 'manager';
    }
    delete customer.type;
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/:type/transfer_customer'.replace(':type', urlType),
        dataType: 'json',
        type: 'put',
        data: customer,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取重复的客户列表
exports.getRepeatCustomerList = function(queryParams) {
    queryParams.type = 'user';
    if (hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL)) {
        queryParams.type = 'manager';
    }
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

//通过重复客户的id获取重复的客户列表
exports.getRepeatCustomersById = function(customerId) {
    let type = 'user';
    if (hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL)) {
        type = 'manager';
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: `/rest/crm/repeat_customer/${type}/${customerId}`,
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

//根据客户id获取客户信息
exports.getCustomerById = function(customerId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/customer/' + customerId,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//查询客户
let queryCustomerAjax;
exports.queryCustomer = function(params, pageSize, pageNum, sorter) {
    pageSize = pageSize || 20;
    pageNum = pageNum || 1;
    //没有关注客户置顶时
    sorter = sorter ? sorter : {field: 'id', order: 'ascend'};
    if (hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL)) {
        params.hasManageAuth = true;
    }
    queryCustomerAjax && queryCustomerAjax.abort();
    var Deferred = $.Deferred();
    let url = '/rest/customer/range/' + pageSize + '/' + pageNum + '/' + sorter.field + '/' + sorter.order;
    let type = 'post';

    if (params.url) {
        url = params.url;
        delete params.url;
    }

    if (params.type) {
        type = params.type;
        delete params.type;
    }

    if (params.page_size) {
        if (params.page_size.type === 'query') {
            params.page_size = pageSize;
        } else if (params.page_size.type === 'params') {
            url = url.replace(':page_size', pageSize);
            delete params.page_size;
        }
    }

    if (params.page_num) {
        if (params.page_num.type === 'query') {
            params.page_num = pageNum;
        } else if (params.page_num.type === 'params') {
            url = url.replace(':page_num', pageNum);
            delete params.page_num;
        }
    }

    queryCustomerAjax = $.ajax({
        url,
        type,
        dataType: 'json',
        data: params,
        success: function(list) {
            //如果数据是放在list字段中的，需要统一到result字段，以与store中的对应
            if (list.list && !list.result) {
                list.result = list.list;
            }

            Deferred.resolve(list);
        },
        error: function(xhr, statusText) {
            if (statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//获取当前页要展示的动态列表
exports.getDynamicList = function(customer_id) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm_dynamic/' + customer_id,
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

exports.delRepeatCustomer = function(customerIdArray) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/repeat_customer/delete',
        dataType: 'json',
        type: 'put',
        data: {ids: JSON.stringify(customerIdArray)},
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.mergeRepeatCustomer = function(mergeObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/repeat_customer/merge',
        dataType: 'json',
        type: 'put',
        data: {customer: JSON.stringify(mergeObj.customer), delete_customers: JSON.stringify(mergeObj.delete_customers)},
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.checkOnlyCustomer = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/customer_only/check',
        dataType: 'json',
        type: 'get',
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
//获取后台管理中配置的行业列表
exports.getIndustries = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/industries',
        dataType: 'json',
        type: 'get',
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

//根据客户名获取行政级别
exports.getAdministrativeLevel = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/administrative_level',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 拨打电话
exports.callOut = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/call/out',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
exports.getCrmUserList = function(reqData) {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/user_list',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                let defaultErrorMsg = reqData.qualify_label ? Intl.get('crm.qualify.user.error', '获取合格用户失败') : Intl.get('user.list.get.failed', '获取用户列表失败');
                Deferred.reject(xhr.responseJSON || defaultErrorMsg);
            }
        }
    });
    return Deferred.promise();
};

//获取是否能添加客户
let getCustomerLimitAjax;
exports.getCustomerLimit = function(reqData) {
    getCustomerLimitAjax && getCustomerLimitAjax.abort();
    let Deferred = $.Deferred();
    getCustomerLimitAjax = $.ajax({
        url: '/rest/crm/limit',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//获取客户历史分数
let getHistoryScoreListAjax;
exports.getHistoryScoreList = function(reqData) {
    getHistoryScoreListAjax && getHistoryScoreListAjax.abort();
    let Deferred = $.Deferred();
    getHistoryScoreListAjax = $.ajax({
        url: '/rest/history/score',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('crm.get.score.history.error', '获取历史分数失败'));
            }
        }
    });
    return Deferred.promise();
};

//释放客户
exports.releaseCustomer = function(reqData) {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/release',
        dataType: 'json',
        type: 'put',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('crm.customer.release.failed', '释放客户失败'));
            }
        }
    });
    return Deferred.promise();
};

//获取客户池中的客户
exports.getPoolCustomer = function(reqData) {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer_pool/customer',
        dataType: 'json',
        type: 'get',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('crm.customer.pool.failed', '获取客户池客户失败'));
            }
        }
    });
    return Deferred.promise();
};
//提取客户
exports.extractCustomer = function(reqData) {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer_pool/customer',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('crm.customer.extract.failed', '提取客户失败'));
            }
        }
    });
    return Deferred.promise();
};

// 通过团队id获取客户阶段（销售流程)
exports.getCustomerStageByTeamId = (teamId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/get/customer/stage/${teamId}`,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 验证是否有权限处理跟进人
exports.checkCrmUpdateUserByCustomerId = (customerId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/customer/check/update/${customerId}`,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
// 是否有权限处理联合跟进人
exports.checkCrmJoinUserByCustomerId = (customerId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/customer/check/join/${customerId}`,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};