import { hasPrivilege } from 'CMP_DIR/privilege/checker';
let teamAjax = require('../../../common/public/ajax/team');
let salesmanAjax = require('../../../common/public/ajax/salesman');
import crmPrivilegeConst from '../privilege-const';

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
//获取当前页的成员列表
exports.getALLUserList = function(searchObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user',
        dataType: 'json',
        type: 'get',
        data: searchObj,
        success: function(userListObj) {
            Deferred.resolve(userListObj);
        },
        error: function(xhr, textStatus) {
            if ('abort' !== textStatus) {
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
//客户批量操作
exports.doBatch = function(type, condition) {
    var Deferred = $.Deferred();
    var jsonStr = JSON.stringify(condition);
    let authType = 'user';
    if(hasPrivilege(crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL)){
        authType = 'manager';
    }
    $.ajax({
        url: `/rest/crm/batch/${authType}?type=${type}`,
        dataType: 'json',
        contentType: 'application/json',
        type: 'put',
        data: jsonStr,
        success: function(taskId) {
            Deferred.resolve(taskId);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('errorcode.20', '批量操作失败'));
        }
    });
    return Deferred.promise();
};

//获取推荐标签
exports.getRecommendTags = function() {
    let type = 'user';
    if(hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL)){
        type = 'manager';
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/crm/get_recommend_tags/' + type,
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

//获取行业列表
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