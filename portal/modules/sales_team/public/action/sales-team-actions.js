/**
 * Created by xiaojinfeng on 2016/04/08.
 */
//联系人的ajax
var SalesTeamAjax = require("../ajax/sales-team-ajax");

function SalesTeamAction() {

    this.generateActions(
        "getIsDeleteMember",
        'getIsAddMember',
        'getIsEditMember',
        'cancelAddMember',
        'cancelEditMember',
        'afterAddMember',
        'afterEditMember',
        'setSelectSalesTeamGroup',
        'showOperationArea',
        'editGroup',
        'cancelEditGroup',
        'addGroup',
        'cancelAddGroup',
        'deleteGroup',
        'hideModalDialog',
        'hideSearchInputFnc',
        'selectTree',
        'toggleGroupTree',
        'hideAllOperationArea',
        'setSalesTeamLoading',
        'setTeamMemberLoading',
        'filterByTeamName',
        'resetSearchSalesTeam',
        'clearDelTeamErrorMsg',
        'addSalesTeamRoot',
        'setSearchContent',
        'refreshTeamListAfterAdd',
        'updateTeamNameAfterEdit',
        'updateSalesGoals'
    );

    this.getSalesTeamList = function () {
        var _this = this;
        SalesTeamAjax.getSalesTeamList().then(function (list) {
            _this.dispatch(list);
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("common.get.sale.lists.failed", "获取销售团队列表失败"));
        });
    };

    this.filterByUserName = function (userName) {
        var _this = this;
        SalesTeamAjax.filterSalesTeamList(userName).then(function (list) {
            _this.dispatch(list);
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("sales.team.filter.by.username.failed", "根据昵称、用户名搜索销售团队失败"));
        });
    };
    //获取销售目标
    this.getSalesGoals= function (teamId) {
        SalesTeamAjax.getSalesGoals(teamId).then((salesGoals)=>{
            this.dispatch(salesGoals);
        }, (errorMsg)=> {
            this.dispatch(errorMsg || Intl.get("sales.team.get.sales.team.member.list.failed", "获取销售目标失败"));
        });
    };

    this.getSalesTeamMemberList = function (teamId) {
        var _this = this;
        SalesTeamAjax.getSalesTeamMemberList(teamId).then(function (list) {
            _this.dispatch(list);
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("sales.team.get.sales.team.member.list.failed", "获取团队成员失败"));
        });
    };

    this.getMemberList = function () {
        var _this = this;
        SalesTeamAjax.getMemberList().then(function (list) {
            _this.dispatch(list);
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("common.get.member.lists.failed", "获取可添加成员列表失败"));
        });
    };

    this.saveDeleteGroup = function (groupId) {
        var _this = this;
        SalesTeamAjax.deleteGroup(groupId).then(function (data) {
            //_this.actions.getSalesTeamList();
            if (data) {
                //刷新添加时展示的不属于任何团队的成员列表
                _this.actions.getMemberList();
                _this.dispatch({success: true, groupId: groupId});
            } else {
                _this.dispatch({success: false, errorMsg: Intl.get("sales.team.del.team.failed", "删除团队失败")});
            }
        }, function (errorMsg) {
            _this.dispatch({success: false, errorMsg: errorMsg || Intl.get("sales.team.del.team.failed", "删除团队失败")});
        });
    };
    //保存添加的团队
    this.saveAddGroup = function (salesTeam, callback) {
        var _this = this;
        SalesTeamAjax.addGroup(salesTeam).then(function (data) {
            if (data) {
                if (callback) {
                    callback({saveResult: "success", saveMsg: Intl.get("common.save.success", "保存成功")}, data);
                }
            } else {
                if (callback) {
                    callback({saveResult: "error", saveMsg: Intl.get("common.save.failed", "保存失败")});
                }
            }
        }, function (errorMsg) {
            if (callback) {
                callback({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
            }
        });
    };
    //保存编辑后的的团队名称及上级团队
    this.saveEditGroup = function (salesTeam, callback) {
        SalesTeamAjax.editGroup(salesTeam).then(function (data) {
            if (data) {
                if (callback) {
                    callback({saveResult: "success", saveMsg: Intl.get("common.save.success", "保存成功")});
                }
            } else {
                if (callback) {
                    callback({saveResult: "error", saveMsg: Intl.get("common.save.failed", "保存失败")});
                }
            }
        }, function (errorMsg) {
            if (callback) {
                callback({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
            }
        });
    };
}

module.exports = alt.createActions(SalesTeamAction);