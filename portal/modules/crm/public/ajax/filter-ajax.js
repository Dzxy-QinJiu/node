import { hasPrivilege } from "CMP_DIR/privilege/checker";
var appAjaxTrans = require("../../../common/public/ajax/app");
exports.getAppList = function () {
    var Deferred = $.Deferred();
    appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(function(list) {
        list = list.map(function(app) {
            return {
                client_id : app.app_id,
                client_name : app.app_name,
                client_logo : app.app_logo
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
let salesTeamListAjax;
exports.getTeamList = function () {
    let type="self";//GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS
    if (hasPrivilege("GET_TEAM_LIST_ALL")) {
        type= "all";
    }
    salesTeamListAjax && salesTeamListAjax.abort();
    let Deferred = $.Deferred();
    $.ajax({
        url: "/rest/crm/sales_team_tree",
        dataType: 'json',
        type: 'get',
        data: {type: type},
        success: function (treeList) {
            let list =[];
            if(_.isArray(treeList) && treeList.length >= 1){
                //遍历团队树
                traversingTeamTree(treeList,list);
            }
            Deferred.resolve(list);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//遍历团队树
function traversingTeamTree(treeList,list) {
    if(_.isArray(treeList)&&treeList.length){
         _.each(treeList, team => {
            list.push({group_id:team.group_id,group_name:team.group_name});
            if(team.child_groups){
                traversingTeamTree(team.child_groups,list);
            }
        });
    }
}

exports.getStageList = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/v2/salesopportunity/term/sale_stages',
        dataType: 'json',
        type: 'post',
        data: {reqData: JSON.stringify({})},
        success: function (resData) {
            Deferred.resolve(resData.result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.getTagList = function () {
    var pageSize = 100;
    var num = 1;
    let type = 'user';
    if(hasPrivilege("CUSTOMER_MANAGER_LABEL_GET")){
        type = 'manager';
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/get_recommend_tags/' + pageSize + '/' + num + '/' + type,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data.result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取销售角色列表
let salesRoleListAjax;
exports.getSalesRoleList=function () {
    let type="user";//CRM_GET_USER_ROLE
    if (hasPrivilege("CRM_GET_MANAGER_ROLE")) {
        type= "manager";
    }
    salesRoleListAjax && salesRoleListAjax.abort();
    let Deferred = $.Deferred();
    salesRoleListAjax=$.ajax({
        url: "/rest/crm_filter/:type/sales_role_list".replace(":type",type),
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data.result);
        },
        error: function (xhr, textStatus) {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};
exports.getStageTagList = function () {
    let type = 'user';//CRM_USER_GET_CUSTOMER_CUSTOMER_LABEL
    if(hasPrivilege("CRM_MANAGER_GET_CUSTOMER_CUSTOMER_LABEL")){
        type = 'manager';
    }
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/stage_tag/' + type,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data.result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取竞品列表
exports.getCompetitorList = function () {
    let type = 'user';//CUSTOMER_USER_COMPETING_PRODUCTS_GET
    if(hasPrivilege("CUSTOMER_MANAGER_COMPETING_PRODUCTS_GET")){
        type = 'manager';
    }
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/competitor_list/' + type,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data.result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取行业列表
exports.getIndustries = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm_filter/industries',
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

exports.getFilterProvinces=function(type){
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm_filter/provinces/' + type,
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