/**
 * Created by wangliping on 2016/10/18.
 */
var OrganizationAjax = require("../ajax/organization-ajax");

function OrganizationAction() {

    this.generateActions(
        'getIsAddMember',//获取是否是添加组织成员的操作
        'cancelAddMember',//取消添加组织成员
        'getIsEditMember',//获取是否是编辑组织成员的操作
        'cancelEditMember',//取消编辑组织成员
        'afterAddMember',//添加组织成员后的处理
        'afterEditMember',//编辑组织成员后的处理
        'setSelectOrganizationGroup',//设置当所查看的组织
        'showOperationArea',//是否展示组编辑菜单
        'editGroup',//编辑组织
        'cancelEditGroup',//取消编辑
        'addGroup',//添加组织
        'cancelAddGroup',//取消添加组织
        'deleteGroup',//删除组织
        'hideModalDialog',//隐藏提示框
        'selectTree',//选择树中要展示的组织
        'toggleGroupTree',//展开/隐藏子组织的处理
        'hideAllOperationArea',//隐藏所有展示组编辑菜单
        'setOrganizationLoading',//正在获取组织列表的设置
        'setTeamMemberLoading',//正在获取组织成员列表的设置
        'clearDelGroupErrorMsg',//清楚删除组织失败的提示内容
        'addOrganizationRoot',//添加根组织
        'filterByOrganizationName',//根据组织名称进行过滤
        'setSearchContent',//设置搜索内容
        'resetSearchOrganization',//重置组织列表
        'refreshGroupListAfterAdd',//添加完组织后刷新组织列表
        'updateOrganizationNameAfterEdit'//修改组织名称后更新组织列表中对应的名称
    );

    this.getOrganizationList = function() {
        var _this = this;
        OrganizationAjax.getOrganizationList().then(function(list) {
            _this.dispatch(list);
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get("organization.get.organization.list.failed"));
        });
    };


    this.getOrganizationMemberList = function(teamId) {
        var _this = this;
        OrganizationAjax.getOrganizationMemberList(teamId).then(function(list) {
            _this.dispatch(list);
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get("organization.get.organization.member.list.failed"));
        });
    };

    this.saveDeleteGroup = function(groupId) {
        var _this = this;
        OrganizationAjax.deleteGroup(groupId).then(function() {
            //刷新添加时展示的不属于任何组织的成员列表
            //_this.actions.getMemberList();
            _this.dispatch({success: true, groupId: groupId});
        }, function(errorMsg) {
            _this.dispatch({success: false, errorMsg: errorMsg || Intl.get("organization.save.delete.group.failed")});
        });
    };

    //保存添加的组织
    this.saveAddGroup = function(organization, callback) {
        OrganizationAjax.addGroup(organization).then(function(data) {
            if (data) {
                if (callback) {
                    callback({saveResult: "success", saveMsg: Intl.get("common.save.success", "保存成功")}, data);
                }
            } else {
                if (callback) {
                    callback({saveResult: "error", saveMsg: Intl.get("common.save.failed", "保存失败")});
                }
            }
        }, function(errorMsg) {
            if (callback) {
                callback({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
            }
        });
    };

    //保存编辑后的的组织名称及上级组织
    this.saveEditGroup = function(organization, callback) {
        OrganizationAjax.editGroup(organization).then(function(data) {
            if (data) {
                if (callback) {
                    callback({saveResult: "success", saveMsg: Intl.get("common.save.success", "保存成功")});
                }
            } else {
                if (callback) {
                    callback({saveResult: "error", saveMsg: Intl.get("common.save.failed", "保存失败")});
                }
            }
        }, function(errorMsg) {
            if (callback) {
                callback({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
            }
        });
    };
}

module.exports = alt.createActions(OrganizationAction);