/**
 * Created by wangliping on 2016/10/18.
 */
var OrganizationAjax = require("../ajax/organization-ajax");
var OrganizationActions = require("./organization-actions");
var SUCCESS = "success";
function OrganizationMemberActions() {

    this.generateActions(
        'setMemberListSaving',
        'setAddMemberListLoading',
        'setAddMemberPageSize',
        'setAddMemberPage',
        'setSelectedMemberRows'
    );

    this.getMemberList = function (queryObj) {
        var _this = this;
        _this.actions.setAddMemberListLoading(true);
        OrganizationAjax.getMemberList(queryObj).then(function (data) {
            _this.dispatch(data);
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get('common.get.member.lists.failed'));
        });
    };

    this.addMember = function (obj) {
        var _this = this;
        OrganizationAjax.addMember(obj).then(function (data) {
            if (data) {
                _this.dispatch({saveResult: "success", saveMsg: Intl.get("common.save.success")});

            } else {
                _this.dispatch({saveResult: "error", saveMsg: Intl.get("common.save.failed")});
            }

        }, function (errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed")});
        });
    };

    this.editMember = function (obj) {
        var _this = this;
        OrganizationAjax.editMember(obj).then(function (data) {
            if (data) {
                _this.dispatch({saveResult: "success", saveMsg: Intl.get("common.save.success")});
            } else {
                _this.dispatch({saveResult: "error", saveMsg: Intl.get("common.save.failed")});
            }

        }, function (errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed")});
        });
    };

    this.clearSaveFlags = function (type, saveResult, obj) {
        if (saveResult == "success") {
            //刷新左侧树中该组织的人数
            if (type == "add") {
                OrganizationActions.afterAddMember(obj);
            } else if (type == "edit") {
                OrganizationActions.afterEditMember(obj);
            }
            //刷新组织成员列表
            OrganizationActions.setTeamMemberLoading(true);
            OrganizationActions.getOrganizationMemberList(obj.groupId);
            //刷新添加时展示的不属于任何组织的成员列表
            //OrganizationActions.getMemberList();
        }
        this.dispatch();
    };
}

module.exports = alt.createActions(OrganizationMemberActions);