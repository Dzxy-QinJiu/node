/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var LeaveApplyAjax = require('../ajax/leave-apply-ajax');
var LeaveApplyUtils = require('../utils/leave-apply-utils');
import UserData from 'PUB_DIR/sources/user-data';
function ApplyViewDetailActions() {
    this.generateActions(
        'setInitState',
        'setInitialData',
        'showCustomerDetail',
        'setApplyComment',//如果是已通过或者是已驳回的申请，不需要发请求
        'setApplyFormDataComment',
        'hideReplyCommentEmptyError',
        'showReplyCommentEmptyError',
        'cancelSendApproval',
        'hideApprovalBtns'//审批完后不在显示审批按钮
    );

    //获取审批单详情
    this.getLeaveApplyDetailById = function(queryObj, status) {
        LeaveApplyAjax.getLeaveApplyDetailById(queryObj, status).then((detail) => {
            this.dispatch({loading: false, error: false, detail: detail, status: status});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //根据申请的id获取审批的状态
    this.getLeaveApplyStatusById = function(queryObj) {
        this.dispatch({loading: true, error: false});
        LeaveApplyAjax.getLeaveApplyStatusById(queryObj).then((list) => {
            this.dispatch({loading: false, error: false, list: list});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //获取回复列表
    this.getLeaveApplyCommentList = function(queryObj) {
        this.dispatch({loading: true, error: false});
        LeaveApplyAjax.getLeaveApplyCommentList(queryObj).then((list) => {
            this.dispatch({loading: false, error: false, list: list});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //添加回复
    this.addLeaveApplyComments = function(obj) {
        this.dispatch({loading: true, error: false});
        LeaveApplyAjax.addLeaveApplyComments(obj).then((replyData) => {
            if (_.isObject(replyData)) {
                //创建回复数据，直接添加到store的回复数组后面
                let replyTime = replyData.comment_time ? replyData.comment_time : moment().valueOf();
                let replyItem = {
                    user_id: replyData.user_id || '',
                    user_name: replyData.user_name || '',
                    comment: replyData.comment || '',
                    comment_time: replyTime
                };
                this.dispatch({loading: false, error: false, reply: replyItem});
            }
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //通过或者驳回审批
    this.approveLeaveApplyPassOrReject = function( obj) {
        this.dispatch({loading: true, error: false});
        LeaveApplyAjax.approveLeaveApplyPassOrReject(obj).then((data) => {
            this.dispatch({loading: false, error: false, data: data, approval: obj.approval});
            //更新选中的申请单类型
            LeaveApplyUtils.emitter.emit('updateSelectedItem', {agree: obj.agree, status: 'success'});
            //刷新用户审批未处理数
            // updateUnapprovedCount();
        }, (errorMsg) => {
            //更新选中的申请单类型
            LeaveApplyUtils.emitter.emit('updateSelectedItem', {status: 'error'});
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
}
module.exports = alt.createActions(ApplyViewDetailActions);