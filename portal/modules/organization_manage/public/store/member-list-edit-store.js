/**
 * Created by wangliping on 2016/10/18.
 */
var MemberListEditActions = require("../action/member-list-edit-actions");
function MemberListEditStore() {

    this.addMemberList = [];//添加成员时成员列表
    this.addMemberTotal = 0;//可添加组织成员的总长度
    this.addMemberPage = 1;//可添加组织成员列表的当前页数
    this.addMemberPageSize = 20;//可添加组织成员列表一页展示的条数
    this.addMemberListTipMsg = "";//获取可添加成员列表时，错误/暂无数据的提示
    this.isLoadingAddMemberList = false;//正在获取可添加成员列表
    //选中的成员
    this.selectedMemberRows = [];
    this.isMemberListSaving = false;//是否正在保存修改的成员列表
    this.saveMemberListResult = "";//error，success
    this.saveMemberListMsg = "";//保存结果的提示信息

    this.bindActions(MemberListEditActions);
}

//清除刚才选中的行
MemberListEditStore.prototype.clearSelectedRows = function() {
    this.selectedMemberRows = [];
};

//设置所选成员
MemberListEditStore.prototype.setSelectedMemberRows = function(rows) {
    this.selectedMemberRows = rows;
};
//设置一页可显示的条数
MemberListEditStore.prototype.setAddMemberPageSize = function(pageSize) {
    this.addMemberPageSize = pageSize;
};
//设置当前页
MemberListEditStore.prototype.setAddMemberPage = function(page) {
    this.addMemberPage = page;
    //切换分页的时候，清除刚才选中的行
    this.clearSelectedRows();
};

//是否正在获取可添加成员列表的设置
MemberListEditStore.prototype.setAddMemberListLoading = function(flag) {
    this.isLoadingAddMemberList = flag;
};

//添加成员时获取不属于任何组织的成员列表
MemberListEditStore.prototype.getMemberList = function(resultData) {
    this.isLoadingAddMemberList = false;
    this.selectedMemberRows = [];
    if (_.isString(resultData)) {
        //获取失败的提示信息
        this.addMemberListTipMsg = resultData;
    } else {
        // 获取当前页用户列表
        var curUserList = resultData.data;
        //确保返回的是个数组
        if (!_.isArray(curUserList)) {
            curUserList = [];
        }
        // 总共的应用数 根据搜索的内容不同，显示的应用数不同
        this.addMemberTotal = resultData.total;
        if (_.isArray(curUserList) && curUserList.length > 0) {
            this.addMemberList = curUserList;
            this.addMemberListTipMsg = "";
        } else {
            this.addMemberList = [];
            this.addMemberListTipMsg = Intl.get("common.no.add.member");
        }
    }
};

//清空保存结果和提示信息
MemberListEditStore.prototype.setMemberListSaving = function(flag) {
    this.isMemberListSaving = flag;
};

//清空保存结果和提示信息
MemberListEditStore.prototype.clearSaveFlags = function() {
    this.saveMemberListResult = "";
    this.saveMemberListMsg = "";
};

//保存结果的处理
MemberListEditStore.prototype.setSaveFlags = function(resultObj) {
    //去掉正在保存的效果
    this.isMemberListSaving = false;
    this.saveMemberListResult = resultObj.saveResult;
    this.saveMemberListMsg = resultObj.saveMsg;
};

//清空保存结果和提示信息
MemberListEditStore.prototype.addMember = function(resultObj) {
    this.setSaveFlags(resultObj);
};

//清空保存结果和提示信息
MemberListEditStore.prototype.editMember = function(resultObj) {
    this.setSaveFlags(resultObj);
};

module.exports = alt.createStore(MemberListEditStore, 'MemberListEditStore');