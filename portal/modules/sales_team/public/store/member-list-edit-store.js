/**
 * Created by xiaojinfeng on 2016/04/08.
 */
var MemberListEdfitActions = require("../action/member-list-edit-actions");

function MemberListEditStore() {
    this.isMemberListSaving = false;//是否正在保存修改的成员列表
    this.saveMemberListResult = "";//error，success
    this.saveMemberListMsg = "";//保存结果的提示信息

    this.bindActions(MemberListEdfitActions);
}

//清空保存结果和提示信息
MemberListEditStore.prototype.setMemberListSaving = function (flag) {
    this.isMemberListSaving = flag;
};

//清空保存结果和提示信息
MemberListEditStore.prototype.clearSaveFlags = function () {
    this.saveMemberListResult = "";
    this.saveMemberListMsg = "";
};

//保存结果的处理
MemberListEditStore.prototype.setSaveFlags = function (resultObj) {
    //去掉正在保存的效果
    this.isMemberListSaving = false;
    this.saveMemberListResult = resultObj.saveResult;
    this.saveMemberListMsg = resultObj.saveMsg;
};
//清空保存结果和提示信息
MemberListEditStore.prototype.addMember = function (resultObj) {
    this.setSaveFlags(resultObj);
};

//清空保存结果和提示信息
MemberListEditStore.prototype.editMember = function (resultObj) {
    this.setSaveFlags(resultObj);
};

module.exports = alt.createStore(MemberListEditStore, 'MemberListEditStore');