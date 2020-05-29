/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
const hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
const RELATEAUTHS = {
    'RELATEALL': 'CRM_MANAGER_CUSTOMER_CLUE_ID',//管理员通过线索id查询客户的权限
    'RELATESELF': 'CRM_USER_CUSTOMER_CLUE_ID'//普通销售通过线索id查询客户的权限
};

let salesmanAjax = require('../../../common/public/ajax/salesman');
let teamAjax = require('../../../common/public/ajax/team');
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
//获取线索来源列表
exports.getClueSource = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_clue/source',
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
//获取线索渠道列表
exports.getClueChannel = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_clue/channel',
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
//获取线索分类列表
exports.getClueClassify = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_clue/classify',
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

//获取销售人员列表
exports.getSalesManList = function() {
    var Deferred = $.Deferred();
    salesmanAjax.getSalesmanListAjax().sendRequest({filter_manager: true})
        .success(list => {
            Deferred.resolve(list);
        }).error((xhr) => {//xhr:XMLHttpRequest
            Deferred.reject(xhr.responseJSON);
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
        filter_manager: true//过滤掉舆情秘书
    }).success(function(list) {
        Deferred.resolve(list);
    }).error(function(xhr, statusText) {
        if (statusText !== 'abort') {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//添加或者更新跟进记录内容
var addCluecustomerTraceAjax;
exports.addCluecustomerTrace = function(submitObj) {
    var Deferred = $.Deferred();
    addCluecustomerTraceAjax && addCluecustomerTraceAjax.abort();
    addCluecustomerTraceAjax = $.ajax({
        url: '/rest/cluecustomer/v2/add/trace',
        dataType: 'json',
        type: 'post',
        data: submitObj,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//把线索客户分配给对应的销售
var distributeCluecustomerToSaleAjax;
exports.distributeCluecustomerToSale = function(submitObj) {
    var Deferred = $.Deferred();
    if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_ALL)) {
        submitObj.hasDistributeAuth = true;
    }
    distributeCluecustomerToSaleAjax && distributeCluecustomerToSaleAjax.abort();
    distributeCluecustomerToSaleAjax = $.ajax({
        url: '/rest/cluecustomer/v2/distribute/sales',
        dataType: 'json',
        type: 'post',
        data: submitObj,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

var distributeCluecustomerToSaleBatchAjax;
exports.distributeCluecustomerToSaleBatch = function(submitObj) {
    var Deferred = $.Deferred();
    var type = 'user';
    if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_ALL)){
        type = 'manager';
    }
    distributeCluecustomerToSaleBatchAjax && distributeCluecustomerToSaleBatchAjax.abort();
    distributeCluecustomerToSaleBatchAjax = $.ajax({
        url: '/rest/cluecustomer/change/sales/batch/' + type,
        dataType: 'json',
        type: 'post',
        data: submitObj,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

var updateClueContactDetailAjax;
//修改线索联系人相关信息
exports.updateClueContactDetail = function(data) {
    var Deferred = $.Deferred();
    updateClueContactDetailAjax && updateClueContactDetailAjax.abort();
    updateClueContactDetailAjax = $.ajax({
        url: '/rest/cluecustomer/v2/update/detailitem',
        dataType: 'json',
        type: 'put',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
var updateClueItemDetailAjax;
//修改线索的基本信息
exports.updateClueItemDetail = function(data) {
    var Deferred = $.Deferred();
    updateClueItemDetailAjax && updateClueItemDetailAjax.abort();
    updateClueItemDetailAjax = $.ajax({
        url: '/rest/cluecustomer/v2/update/detailitem',
        dataType: 'json',
        type: 'put',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//获取全文搜索的线索
exports.getClueFulltext = function(queryObj) {
    var pageSize = queryObj.pageSize;
    delete queryObj.pageSize;
    var pageNum = queryObj.pageNum;
    delete queryObj.pageNum;
    var sorter = queryObj.sorter ? queryObj.sorter : {field: 'source_time', order: 'descend'};
    delete queryObj.sorter;
    var type = 'user';
    if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL)){
        type = 'manager';
    }
    var url = '/rest/get/clue/fulltext/' + pageSize + '/' + pageNum + '/' + sorter.field + '/' + sorter.order + '/' + type;
    var Deferred = $.Deferred();
    $.ajax({
        url: url ,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//申请试用的详情
exports.getApplyTryData = function(id) {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue/apply_try',
        dataType: 'json',
        type: 'get',
        data: {
            id: id
        },
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (err) => {
            Deferred.reject(err.responseJSON);
        }
    });
    return Deferred.promise();
};

//通过关键字获取线索列表
let getClueListByKeywordAjax;
exports.getClueListByKeyword = function(queryObj) {
    let pageSize = queryObj.pageSize;
    delete queryObj.pageSize;
    let sorter = queryObj.sorter ? queryObj.sorter : {field: 'source_time', order: 'descend'};
    delete queryObj.sorter;
    let type = '';
    if(hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_SELF)) {
        type = 'user';
    }else if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL)){
        type = 'manager';
    }
    let query = {
        query: queryObj
    };
    let url = `/rest/clue/${type}/${pageSize}/${sorter.field}/${sorter.order}`;
    let Deferred = $.Deferred();
    $.ajax({
        url: url ,
        dataType: 'json',
        type: 'post',
        data: query,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//线索关联
exports.setClueAssociatedCustomer = function(submitObj) {
    var Deferred = $.Deferred();
    var type = 'self';
    if (hasPrivilege(RELATEAUTHS.RELATEALL)) {
        type = 'all';
    }
    $.ajax({
        url: '/rest/relate_clue_and_customer/' + type,
        dataType: 'json',
        contentType: 'application/json',
        type: 'put',
        data: JSON.stringify(submitObj),
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取当前页要展示的动态列表
exports.getDynamicList = function(clue_id, page_size) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_dynamic/' + clue_id + '/' + page_size,
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
//根据线索的id获取线索详情
exports.getClueDetailById = function(clue_id) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue/detail/' + clue_id,
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
//根据线索的id删除某条线索
exports.deleteClueById = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue/delete',
        dataType: 'json',
        type: 'delete',
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
//获取个人线索推荐保存配置
exports.getSettingCustomerRecomment = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue/recommend/condition',
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
//添加和修改个人线索推荐保存配置
var addOrEditSettingCustomerRecommentAjax = null;
exports.addOrEditSettingCustomerRecomment = function(data) {
    var Deferred = $.Deferred();
    addOrEditSettingCustomerRecommentAjax && addOrEditSettingCustomerRecommentAjax.abort();
    addOrEditSettingCustomerRecommentAjax = $.ajax({
        url: '/rest/clue/recommend/condition',
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//获取线索的推荐列表
var getRecommendClueListsAjax = null;
exports.getRecommendClueLists = function(obj) {
    let load_size = _.get(obj, 'load_size', 20);
    delete obj.load_size;
    var Deferred = $.Deferred();
    getRecommendClueListsAjax && getRecommendClueListsAjax.abort();
    getRecommendClueListsAjax = $.ajax({
        url: '/rest/clue/recommend/lists?load_size=' + load_size,
        dataType: 'json',
        type: 'post',
        data: {reqData: JSON.stringify(obj)},
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
//释放线索
exports.releaseClue = function(reqData) {
    let Deferred = $.Deferred();
    let authType = 'user';
    if(hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_POOL_ALL)){
        authType = 'manager';
    }
    $.ajax({
        url: `/rest/clue/release/${authType}`,
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('clue.customer.fail.to.release.tip', '释放线索失败'));
            }
        }
    });
    return Deferred.promise();
};

//批量释放线索
exports.batchReleaseClue = function(condition) {
    var Deferred = $.Deferred();
    var jsonStr = JSON.stringify(condition);
    let authType = 'user';
    if(hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_POOL_ALL)){
        authType = 'manager';
    }
    $.ajax({
        url: `/rest/clue/batch/release/${authType}`,
        dataType: 'json',
        contentType: 'application/json',
        type: 'post',
        data: jsonStr,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('errorcode.20', '批量操作失败'));
        }
    });
    return Deferred.promise();
};
exports.checkOnlyClueNamePhone = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/clue_only/check',
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
let getCompanyListByNameAjax = null;
exports.getCompanyListByName = function(queryObj) {
    var Deferred = $.Deferred();
    getCompanyListByNameAjax && getCompanyListByNameAjax.abort();
    getCompanyListByNameAjax = $.ajax({
        url: '/rest/recommend/clue/company/name',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, errorText) {
            if(errorText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};