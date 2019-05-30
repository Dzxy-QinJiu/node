/**
 * Created by xiaojinfeng on 2016/04/08.
 */
let teamAjax = require('../../../common/public/ajax/team');
let memberAjax = require('../../../member_manage/public/ajax');

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

exports.filterSalesTeamList = function(userName) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/filter/sales_team_list/' + userName,
        dataType: 'json',
        type: 'get',
        success: function(list) {
            Deferred.resolve(list);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
//获取销售目标
exports.getSalesGoals = function(teamId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/team/sales_goals/' + teamId,
        dataType: 'json',
        type: 'get',
        success: function(salesGoals) {
            Deferred.resolve(salesGoals);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取某销售团队成员列表
exports.getSalesTeamMemberList = function(groupId) {
    var Deferred = $.Deferred();
    teamAjax.getMemberListByTeamIdAjax().resolvePath({
        group_id: groupId
    }).sendRequest({with_teamrole: true}).success(function(list) {
        Deferred.resolve(list);
    }).error(function(errorInfo) {
        Deferred.reject(errorInfo.responseJSON);
    });
    return Deferred.promise();
};

exports.getMemberList = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/member_list',
        dataType: 'json',
        type: 'get',
        success: function(list) {
            Deferred.resolve(list);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.addMember = function(obj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_team_member',
        dataType: 'json',
        contentType: 'application/json',
        type: 'post',
        data: JSON.stringify(obj),
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.editMember = function(obj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_team_member',
        dataType: 'json',
        contentType: 'application/json',
        type: 'put',
        data: JSON.stringify(obj),
        success: function(list) {
            Deferred.resolve(list);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//添加团队
exports.addGroup = function(salesTeam) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_team',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(salesTeam),
        success: function(salesTeamCreated) {
            Deferred.resolve(salesTeamCreated);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改团队
exports.editGroup = function(salesTeam) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_team',
        dataType: 'json',
        type: 'put',
        data: salesTeam,
        success: function(salesTeamModified) {
            Deferred.resolve(salesTeamModified);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//删除团队
exports.deleteGroup = function(groupId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_team/' + groupId,
        type: 'delete',
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//保存销售目标
exports.saveSalesGoals = function(salesGoals) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/team/sales_goals',
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(salesGoals),
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

