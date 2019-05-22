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



module.exports = alt.createStore(ApplyApproveManageStore, 'ApplyApproveManageStore');
