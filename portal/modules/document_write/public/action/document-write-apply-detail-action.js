/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var DocumentWriteApplyAjax = require('../ajax/document-write-apply-ajax');
var DocumentWriteUtils = require('../utils/document-write-utils');
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import ApplyApproveAjax from '../../../common/public/ajax/apply-approve';
import {getApplyDetailById,getApplyStatusById,getApplyCommentList,addApplyComments,cancelApplyApprove} from 'PUB_DIR/sources/utils/apply-common-data-utils';
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
        'setDetailInfoObjAfterAdd',
        'setDetailInfo',
        'setUpdateFilesLists'
    );

    //获取审批单详情
    this.getApplyDetailById = function(queryObj, status) {
        getApplyDetailById(queryObj, status).then((detail) => {
            this.dispatch({loading: false, error: false, detail: detail, status: status});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //根据申请的id获取审批的状态
    this.getApplyStatusById = function(queryObj) {
        this.dispatch({loading: true, error: false});
        getApplyStatusById(queryObj).then((list) => {
            this.dispatch({loading: false, error: false, list: list});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //获取回复列表
    this.getApplyCommentList = function(queryObj) {
        this.dispatch({loading: true, error: false});
        getApplyCommentList(queryObj).then((list) => {
            this.dispatch({loading: false, error: false, list: list});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg || Intl.get('failed.get.reply.comment', '获取回复列表失败')});
        });
    };
    //添加回复
    this.addApplyComments = function(obj) {
        this.dispatch({loading: true, error: false});
        addApplyComments(obj).then((replyData) => {
            this.dispatch({loading: false, error: false, reply: replyData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //通过或者驳回审批
    this.approveApplyPassOrReject = function( obj,callback) {
        this.dispatch({loading: true, error: false});
        DocumentWriteApplyAjax.approveApplyPassOrReject(obj).then((data) => {
            if (data){
                this.dispatch({loading: false, error: false, data: data, approval: obj.approval});
                //更新选中的申请单类型
                //如果不是最后确认的那一步，状态就还是ongoing
                if(obj.report_ids || obj.agree === 'reject' || obj.agree === 'cancel'){
                    DocumentWriteUtils.emitter.emit('updateSelectedItem', {agree: obj.agree, status: 'success'});
                    if (Oplate && Oplate.unread) {
                        Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEDOCUMENTWRITE] -= 1;
                        if (timeoutFunc) {
                            clearTimeout(timeoutFunc);
                        }
                        timeoutFunc = setTimeout(function() {
                            //触发展示的组件待审批数的刷新
                            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT);
                        }, timeout);
                    }
                    _.isFunction(callback) && callback();
                }
            }else{
                //更新选中的申请单类型
                DocumentWriteUtils.emitter.emit('updateSelectedItem', {status: 'error'});
                this.dispatch({loading: false, error: true, errorMsg: Intl.get('fail.apply.approve.result','审批失败')});
            }

        }, (errorMsg) => {
            //更新选中的申请单类型
            DocumentWriteUtils.emitter.emit('updateSelectedItem', {status: 'error'});
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    // 撤销申请
    this.cancelApplyApprove = function(obj,callback) {
        var errTip = Intl.get('user.apply.detail.backout.error', '撤销申请失败');
        this.dispatch({loading: true, error: false});
        cancelApplyApprove(obj).then((data) => {
            _.isFunction(callback) && callback();
            if (data) {
                this.dispatch({loading: false, error: false});
                DocumentWriteUtils.emitter.emit('updateSelectedItem', {id: obj.id, cancel: true, status: 'success'});
            }else {
                this.dispatch({loading: false, error: true, errorMsg: errTip});
                DocumentWriteUtils.emitter.emit('updateSelectedItem', {status: 'error',cancel: false});
            }
        }, (errorMsg) => {
            _.isFunction(callback) && callback();
            var errMsg = errorMsg || errTip;
            this.dispatch({loading: false, error: true, errorMsg: errMsg});
            DocumentWriteUtils.emitter.emit('updateSelectedItem', {status: 'error',cancel: false});
        });
    };
    //获取下一节点的负责人
    this.getNextCandidate = function(queryObj) {
        ApplyApproveAjax.getNextCandidate().sendRequest(queryObj).success((list) => {
            if (_.isArray(list)){
                this.dispatch(list);
            }
        }).error(this.dispatch({error: true}));
    };
}
module.exports = alt.createActions(ApplyViewDetailActions);