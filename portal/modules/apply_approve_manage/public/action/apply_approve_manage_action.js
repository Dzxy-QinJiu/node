/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/21.
 */
var applyApproveManageAjax = require('../ajax/apply_approve_manage_ajax');
function ApplyApproveManageActions() {
    this.generateActions(

    );
    //添加自定义的审批流程
    this.addSelfSettingWorkFlow = function(submitObj,callback) {
        this.dispatch({error: false, loading: true});
        applyApproveManageAjax.addSelfSettingWorkFlow(submitObj).then((result) => {
            this.dispatch({error: false, loading: false});
            _.isFunction(callback) && callback(result);
        }, (errorMsg) => {
            this.dispatch({error: true, loading: false, errorMsg: errorMsg});

        });
    };


}
module.exports = alt.createActions(ApplyApproveManageActions);