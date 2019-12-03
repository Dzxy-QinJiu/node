import { hasPrivilege } from 'CMP_DIR/privilege/checker';
var appAjaxTrans = require('../../../common/public/ajax/app');
import ajaxPro from 'MOD_DIR/common/ajaxUtil';
import crmPrivilegeConst from '../privilege-const';
function getFilterItemPrivelegeType() {
    let type = 'user';//crmPrivilegeConst.CRM_LIST_CUSTOMERS
    if (hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL)) {
        type = 'manager';
    }
    return type;
}
exports.getAppList = function() {
    var Deferred = $.Deferred();
    appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(function(list) {
        list = list.map(function(app) {
            return {
                client_id: app.app_id,
                client_name: app.app_name,
                client_logo: app.app_logo
            };
        });
        Deferred.resolve(list);
    }).error(function(errorMsg) {
        Deferred.reject(errorMsg.responseJSON);
    }).timeout(function(errorMsg) {
        Deferred.reject(errorMsg.responseJSON);
    });
    return Deferred.promise();
};

exports.getStageList = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/v2/salesopportunity/term/sale_stages',
        dataType: 'json',
        type: 'post',
        data: { reqData: JSON.stringify({}) },
        success: function(resData) {
            Deferred.resolve(resData.result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取系统标签列表
exports.getSystemTagList = function() {
    let type = getFilterItemPrivelegeType();
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/immutable_labels/' + type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data.result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.getTagList = function() {
    let type = getFilterItemPrivelegeType();
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/get_recommend_tags/' + type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data.result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取销售角色列表
let salesRoleListAjax;
exports.getSalesRoleList = function() {
    let type = getFilterItemPrivelegeType();
    salesRoleListAjax && salesRoleListAjax.abort();
    let Deferred = $.Deferred();
    salesRoleListAjax = $.ajax({
        url: '/rest/crm_filter/:type/sales_role_list'.replace(':type', type),
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data.result);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//获取负责人列表
exports.getOwnerList = function() {
    let type = getFilterItemPrivelegeType();
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/owner/' + type,
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

exports.getStageTagList = function() {
    let type = getFilterItemPrivelegeType();
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/stage_tag/' + type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data.result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取竞品列表
exports.getCompetitorList = function() {
    let type = getFilterItemPrivelegeType();
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/competitor_list/' + type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data.result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取行业列表
exports.getIndustries = function() {
    let type = getFilterItemPrivelegeType();
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm_filter/industries/' + type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.getFilterProvinces = function() {
    let type = getFilterItemPrivelegeType();
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm_filter/provinces/' + type,
        dataType: 'json',
        type: 'get',
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

//常用筛选项的增删改查
exports.addCommonFilter = params => ajaxPro('addCommonFilter', params);

exports.updateCommonFilter = params => ajaxPro('updateCommonFilter', params);

exports.delCommonFilter = params => ajaxPro('delCommonFilter', params);

exports.getCommonFilterList = params => ajaxPro('getCommonFilterList', params);

//获取客户池中聚合的筛选项
exports.getCustomerPoolFilterItems = function(queryParam) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer_pool/filter/items',
        dataType: 'json',
        type: 'get',
        data: queryParam,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
