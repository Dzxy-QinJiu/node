import { hasPrivilege } from "CMP_DIR/privilege/checker";
let teamAjax = require("../../../common/public/ajax/team");
let salesmanAjax = require("../../../common/public/ajax/salesman");
//获取销售人员列表
exports.getSalesManList = function () {
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
exports.getSalesTeamMembers = function (teamId) {
    salesTeamMembersAjax && salesTeamMembersAjax.abort();
    var Deferred = $.Deferred();
    salesTeamMembersAjax = teamAjax.getMemberListByTeamIdAjax().resolvePath({
        group_id: teamId
    }).sendRequest({
        filter_manager: true//过滤掉舆情秘书
    }).success(function (list) {
        Deferred.resolve(list);
    }).error(function (xhr, statusText) {
        if (statusText !== 'abort') {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//客户批量操作
exports.doBatch = function (type, condition) {
    var Deferred = $.Deferred();
    var jsonStr = JSON.stringify(condition);
    $.ajax({
        url: '/rest/crm/batch?type=' + type,
        dataType: 'json',
        contentType: 'application/json',
        type: 'put',
        data: jsonStr,
        success: function (taskId) {
            Deferred.resolve(taskId);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取推荐标签
exports.getRecommendTags = function () {
    var pageSize = 100;
    var num = 1;
    let type = 'user';
    if(hasPrivilege("CUSTOMER_MANAGER_LABEL_GET")){
        type = 'manager';
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/get_recommend_tags/' + pageSize + '/' + num + '/'+ type,
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

//获取行业列表
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