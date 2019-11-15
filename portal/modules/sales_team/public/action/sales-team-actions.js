/**
 * Created by xiaojinfeng on 2016/04/08.
 */
//联系人的ajax
const SalesTeamAjax = require('../ajax/sales-team-ajax');
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';


function SalesTeamAction() {

    this.generateActions(
        'getIsDeleteMember',
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
        'handleCancelDeleteGroup', // 取消删除部门
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
        'updateSalesGoals',
        'updateCurShowTeamMemberObj',
        'showUserInfoPanel',
        'closeRightPanel',
        'handleMouseEnterItemLine', // 处理鼠标移入
        'handleMouseLeaveTreeZone', // 处理鼠标移出
        'handleMouseHoverMoreBtn', // 处理鼠标悬停更多按钮
        'handlePopOverVisible', // 处理popover浮层的显示
    );

    //获取统计团队内成员个数的列表
    this.getTeamMemberCountList = function() {
        SalesTeamAjax.getTeamMemberCountList().then((resData) => {
            this.dispatch(resData);
        }, (errMsg) => {
            this.dispatch(errMsg);
        }
        );
    };

    this.getSalesTeamList = function() {
        // 获取销售部门的数据
        getMyTeamTreeAndFlattenList(data => {
            if(data.errorMsg) {
                this.dispatch(data.errorMsg || Intl.get('common.get.sale.lists.failed', '获取销售团队列表失败'));
            } else {
                let teamList = _.get(data, 'teamList');
                // 获取组织信息
                SalesTeamAjax.getMemberOrganization().then( (result) => {
                    let organizationName = _.get(result, 'name');
                    let organizationId = _.get(result, 'id');
                    // 部门树的数据是由组织和部门信息组成的
                    teamList.unshift({group_name: organizationName, group_id: organizationId});
                    this.dispatch(teamList);
                }, () => {
                    this.dispatch(teamList);
                } );
            }
        },true);
    };

    this.filterByUserName = function(userName) {
        var _this = this;
        SalesTeamAjax.filterSalesTeamList(userName).then(function(list) {
            _this.dispatch(list);
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get('sales.team.filter.by.username.failed', '根据昵称、用户名搜索销售团队失败'));
        });
    };
    //获取销售目标
    this.getSalesGoals = function(teamId) {
        this.dispatch({loading: true, error: false});
        SalesTeamAjax.getSalesGoals(teamId).then((salesGoals) => {
            this.dispatch({loading: false, error: false, result: salesGoals});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg || Intl.get('sales.team.get.sales.team.member.list.failed', '获取销售目标失败')});
        });
    };

    this.getSalesTeamMemberList = function(teamId) {
        SalesTeamAjax.getSalesTeamMemberList(teamId).then( (list) => {
            this.dispatch(list);
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('sales.team.get.sales.team.member.list.failed', '获取团队成员失败'));
        });
    };

    this.getMemberList = function() {
        SalesTeamAjax.getMemberList().then( (list) => {
            this.dispatch(list);
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('common.get.member.lists.failed', '获取可添加成员列表失败'));
        });
    };

    this.saveDeleteGroup = function(groupId) {
        var _this = this;
        SalesTeamAjax.deleteGroup(groupId).then(function(data) {
            //_this.actions.getSalesTeamList();
            if (data) {
                //刷新添加时展示的不属于任何团队的成员列表
                _this.actions.getMemberList();
                _this.dispatch({success: true, groupId: groupId});
            } else {
                _this.dispatch({success: false, errorMsg: Intl.get('sales.team.del.team.failed', '删除团队失败')});
            }
        }, function(errorMsg) {
            _this.dispatch({success: false, errorMsg: errorMsg || Intl.get('sales.team.del.team.failed', '删除团队失败')});
        });
    };
    //保存添加的团队
    this.saveAddGroup = function(salesTeam, callback) {
        var _this = this;
        SalesTeamAjax.addGroup(salesTeam).then(function(data) {
            if (data) {
                if (callback) {
                    callback({saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功')}, data);
                }
            } else {
                if (callback) {
                    callback({saveResult: 'error', saveMsg: Intl.get('common.save.failed', '保存失败')});
                }
            }
        }, function(errorMsg) {
            if (callback) {
                callback({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败')});
            }
        });
    };
    //保存编辑后的的团队名称及上级团队
    this.saveEditGroup = function(salesTeam, callback) {
        SalesTeamAjax.editGroup(salesTeam).then(function(data) {
            if (data) {
                if (callback) {
                    callback({saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功')});
                }
            } else {
                if (callback) {
                    callback({saveResult: 'error', saveMsg: Intl.get('common.save.failed', '保存失败')});
                }
            }
        }, function(errorMsg) {
            if (callback) {
                callback({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败')});
            }
        });
    };
}

module.exports = alt.createActions(SalesTeamAction);