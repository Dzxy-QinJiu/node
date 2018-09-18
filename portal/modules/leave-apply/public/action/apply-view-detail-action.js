/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/18.
 */
var LeaveApplyAjax = require('../ajax/leave-apply-ajax');
function ApplyViewDetailActions() {
    this.generateActions(
        'setInitState',
        'setInitialData',
        'showCustomerDetail'
    );

    //获取审批单详情
    this.getLeaveApplyDetailById = function(queryObj, applyData) {
        //如果已获取了某个详情数据，针对从url中的申请id获取的详情数据
        if (applyData) {
            this.dispatch({loading: false, error: false, detail: applyData.detail});
        } else {
            LeaveApplyAjax.getLeaveApplyDetailById(queryObj).then((detail) => {
                this.dispatch({loading: false, error: false, detail: detail});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            });
        }
    };
}
module.exports = alt.createActions(ApplyViewDetailActions);