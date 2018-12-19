/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var LeaveApplyAjax = require('../ajax/leave-apply-ajax');
var LeaveApplyUtils = require('../utils/leave-apply-utils');
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import ApplyApproveAjax from '../../../common/public/ajax/apply-approve';
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
        'hideApprovalBtns',//审批完后不在显示审批按钮
        'hideCancelBtns',//审批完后不再显示撤销按钮
        'setDetailInfoObjAfterAdd'
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
            this.dispatch({loading: false, error: true, errorMsg: errorMsg || Intl.get('failed.get.reply.comment', '获取回复列表失败')});
        });
    };
    //添加回复
    this.addLeaveApplyComments = function(obj) {
        this.dispatch({loading: true, error: false});
        LeaveApplyAjax.addLeaveApplyComments(obj).then((replyData) => {
            this.dispatch({loading: false, error: false, reply: replyData});
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
            if (Oplate && Oplate.unread) {
                Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE] -= 1;
                if (timeoutFunc) {
                    clearTimeout(timeoutFunc);
                }
                timeoutFunc = setTimeout(function() {
                    //触发展示的组件待审批数的刷新
                    notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT);
                }, timeout);
            }
        }, (errorMsg) => {
            //更新选中的申请单类型
            LeaveApplyUtils.emitter.emit('updateSelectedItem', {status: 'error'});
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    // 撤销申请
    this.cancelApplyApprove = function(obj,callback) {
        var errTip = Intl.get('user.apply.detail.backout.error', '撤销申请失败');
        this.dispatch({loading: true, error: false});
        LeaveApplyAjax.cancelApplyApprove(obj).then((data) => {
            _.isFunction(callback) && callback();
            if (data) {
                this.dispatch({loading: false, error: false});
                LeaveApplyUtils.emitter.emit('updateSelectedItem', {id: obj.id, cancel: true, status: 'success'});
            }else {
                this.dispatch({loading: false, error: true, errorMsg: errTip});
                LeaveApplyUtils.emitter.emit('updateSelectedItem', {status: 'error',cancel: false});
            }
        }, (errorMsg) => {
            _.isFunction(callback) && callback();
            var errMsg = errorMsg || errTip;
            this.dispatch({loading: false, error: true, errorMsg: errMsg});
            LeaveApplyUtils.emitter.emit('updateSelectedItem', {status: 'error',cancel: false});
        });
    };
    //获取下一节点的负责人
    this.getNextCandidate = function(queryObj) {
        ApplyApproveAjax.getNextCandidate().sendRequest(queryObj).success((list) => {
            if (_.isArray(list)){
                this.dispatch(list);
            }
        }).error( this.dispatch({error: true}));
    };
}
module.exports = alt.createActions(ApplyViewDetailActions);