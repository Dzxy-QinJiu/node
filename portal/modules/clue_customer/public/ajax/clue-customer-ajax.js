/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
const hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;
const AUTHS = {
    "GETALL": "CLUECUSTOMER_QUERY_MANAGER",
    "GETSELF": "CLUECUSTOMER_QUERY_USER"
};
const DISTRIBUTEAUTHS = {
    "DISTRIBUTEALL": "CLUECUSTOMER_DISTRIBUTE_MANAGER",
    "DISTRIBUTESELF": "CLUECUSTOMER_DISTRIBUTE_USER"
};
let salesmanAjax = require("../../../common/public/ajax/salesman");
let teamAjax = require("../../../common/public/ajax/team");
//查询线索客户
exports.getClueCustomerList = function(clueCustomerTypeFilter, rangParams, pageSize, sorter, lastCustomerId) {
    pageSize = pageSize || 20;
    sorter = sorter ? sorter : {field: "id", order: "descend"};
    var data = {
        clueCustomerTypeFilter: JSON.stringify(clueCustomerTypeFilter),
        rangParams: JSON.stringify(rangParams),
        lastCustomerId: lastCustomerId
    };
    if (hasPrivilege(AUTHS.GETALL)) {
        data.hasManageAuth = true;
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/v2/customer/range/clue/' + pageSize + "/" + sorter.field + "/" + sorter.order,
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
//联系人电话唯一性的验证
exports.checkOnlyCustomer = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_clue/only/check',
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
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//把线索客户分配给对应的销售
var distributeCluecustomerToSaleAjax;
exports.distributeCluecustomerToSale = function(submitObj) {
    var Deferred = $.Deferred();
    if (hasPrivilege(DISTRIBUTEAUTHS.DISTRIBUTEALL)) {
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
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//更新线索客户的基本信息
var updateCluecustomerDetailAjax;
exports.updateCluecustomerDetail = function(submitObj) {
    var data = {},updateObj = {};
    //如果是修改联系人的相关信息时，不但要传客户的id还要传联系人的id
    //更新联系人的相关字段时
    if (submitObj.contact_id){
        //客户的id
        updateObj.id = submitObj.user_id;
        //联系人的id
        updateObj.contacts = [{"id": submitObj.contact_id}];
        delete submitObj.contact_id;
        delete submitObj.user_id;
        for (var key in submitObj){
            //要更新的字段
            data.updateItem = key;
            if (key == "contact_name"){
                //联系人的名字
                updateObj.contacts[0]["name"] = submitObj[key];
            }else{
                updateObj.contacts[0][key] = [submitObj[key]];
            }
        }
    }else{
        //修改除联系人之外的信息,如线索来源，接入渠道 user_id是修改销售的时候组件内部的属性
        updateObj.id = submitObj.id || submitObj.user_id;
        delete submitObj.id;
        delete submitObj.user_id;
        for(var key in submitObj){
            data.updateItem = key;
            updateObj[key] = submitObj[key];
        }
    }
    data.updateObj = JSON.stringify(updateObj);
    var Deferred = $.Deferred();
    updateCluecustomerDetailAjax && updateCluecustomerDetailAjax.abort();
    updateCluecustomerDetailAjax = $.ajax({
        url: '/rest/cluecustomer/v2/update/detailitem',
        dataType: 'json',
        type: 'put',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
