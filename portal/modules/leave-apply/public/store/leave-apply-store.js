/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var LeaveApplyAction = require('../action/leave-apply-action');
function LeaveApplyStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(LeaveApplyAction);
}
LeaveApplyStore.prototype.setInitState = function() {
    //获取全部申请信息时
    this.isLoadingAllApply = true;
    this.allApplyErrMsg = '';
    this.allApplyList = [];
    //获取由自己发起的出差申请
    this.isLoadingSelfApply = true;
    this.selfApplyErrMsg = '';
    this.selfApplyList = [];
    //获取由我审批的出差申请
    this.isLoadingWrokList = true;
    this.workListErrMsg = '';
    this.workLisApplyList = [];

};
LeaveApplyStore.prototype.getAllApplyList = function(data) {
    if (data.loading){
        this.isLoadingAllApply = true;
        this.allApplyErrMsg = '';
        this.allApplyList = [];
    }else if (data.error){
        this.isLoadingAllApply = false;
        this.allApplyErrMsg = data.errMsg;
        this.allApplyList = [];
    }else{
        this.isLoadingAllApply = false;
        this.allApplyErrMsg = '';
        this.allApplyList = data.list;
    }

};

module.exports = alt.createStore(LeaveApplyStore, 'LeaveApplyStore');