/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/21.
 */
var ApplyApproveManageAction = require('../action/apply_approve_manage_action');

function ApplyApproveManageStore() {
    //初始化state数据
    this.resetState();
    this.bindActions(ApplyApproveManageAction);
}
ApplyApproveManageStore.prototype.resetState = function() {
    this.addWorkFlowLoading = false;
    this.addWorkFlowErrMsg = '';
};
ApplyApproveManageStore.prototype.addSelfSettingWorkFlow = function (result) {
    if (result.loading) {
        this.addWorkFlowLoading = true;
        this.addWorkFlowErrMsg = '';
    } else if (result.error) {
        this.addWorkFlowLoading = false;
        this.addWorkFlowErrMsg = result.errorMsg;
    } else {
        this.addWorkFlowLoading = false;
        this.addWorkFlowErrMsg = '';
    }
};
ApplyApproveManageStore.prototype.editSelfSettingWorkFlow = function (result) {
    if (result.loading) {
        this.editWorkFlowLoading = true;
        this.editWorkFlowErrMsg = '';
    } else if (result.error) {
        this.editWorkFlowLoading = false;
        this.editWorkFlowErrMsg = result.errorMsg;
    } else {
        this.editWorkFlowLoading = false;
        this.editWorkFlowErrMsg = '';
    }
};
ApplyApproveManageStore.prototype.delSelfSettingWorkFlow = function (result) {
    if (result.loading) {
        this.delWorkFlowLoading = true;
        this.delWorkFlowErrMsg = '';
    } else if (result.error) {
        this.delWorkFlowLoading = false;
        this.delWorkFlowErrMsg = result.errorMsg;
    } else {
        this.delWorkFlowLoading = false;
        this.delWorkFlowErrMsg = '';
    }
};
ApplyApproveManageStore.prototype.saveSelfSettingWorkFlowRules = function (result) {
    if (result.loading) {
        this.saveRulesWorkFlowLoading = true;
        this.saveRulesWorkFlowErrMsg = '';
    } else if (result.error) {
        this.saveRulesWorkFlowLoading = false;
        this.saveRulesWorkFlowErrMsg = result.errorMsg;
    } else {
        this.saveRulesWorkFlowLoading = false;
        this.saveRulesWorkFlowErrMsg = '';
    }
};


module.exports = alt.createStore(ApplyApproveManageStore, 'ApplyApproveManageStore');
