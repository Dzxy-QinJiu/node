/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var DocumentWriteApplyAjax = require('../ajax/document-write-apply-ajax');
var ApplyApproveUtils = require('MOD_DIR/apply_approve_list/public/utils/apply_approve_utils');
import ApplyApproveAjax from 'MOD_DIR/common/public/ajax/apply-approve';
import {getApplyDetailById,getApplyCommentList,addApplyComments,cancelApplyApprove} from 'PUB_DIR/sources/utils/apply-common-data-utils';
import {changeApplyStatusPassOrReject, checkIfLeader} from 'PUB_DIR/sources/utils/common-method-util';
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
        'setUpdateFilesLists',
        'setNextCandidateIds',
        'setNextCandidateName',//下一节点审批人的名字
        'setNextCandidate',
        'showOrHideApprovalBtns'
    );

    //获取审批单详情
    this.getApplyDetailById = function(queryObj, status, applyData) {
        if (applyData){
            this.dispatch({loading: false, error: false, detail: applyData.detail, status: status});
        }else{
            getApplyDetailById(queryObj).then((detail) => {
                this.dispatch({loading: false, error: false, detail: detail, status: status});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            });
        }
    };
    //获取该审批所在节点
    this.getApplyTaskNode = function(queryObj){
        ApplyApproveAjax.getApplyTaskNode().sendRequest(queryObj).success((list) => {
            if (_.isArray(list)) {
                this.dispatch(list);
            }
        }).error(this.dispatch({error: true}));
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
    this.addApplyComments = function(obj,callback) {
        this.dispatch({loading: true, error: false});
        addApplyComments(obj).then((replyData) => {
            this.dispatch({loading: false, error: false, reply: replyData});
            _.isFunction(callback) && callback();
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //通过或者驳回审批
    this.approveApplyPassOrReject = function( obj,callback) {
        this.dispatch({loading: true, error: false});
        DocumentWriteApplyAjax.approveApplyPassOrReject(obj).then((data) => {
            if(data.approveFlag){//approveFlag 审批成功或失败
                this.dispatch({loading: false, error: false});
                _.isFunction(callback) && callback();
                changeApplyStatusPassOrReject(obj,data);
            }else{
                this.dispatch({loading: false, error: true, errorMsg: Intl.get('fail.apply.approve.result', '审批失败')});
            }

        }, (errorMsg) => {
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
                ApplyApproveUtils.emitter.emit('updateSelectedItem', {id: obj.id, cancel: true, status: 'success'});
            }else {
                this.dispatch({loading: false, error: true, errorMsg: errTip});
                ApplyApproveUtils.emitter.emit('updateSelectedItem', {status: 'error',cancel: false});
            }
        }, (errorMsg) => {
            _.isFunction(callback) && callback();
            var errMsg = errorMsg || errTip;
            this.dispatch({loading: false, error: true, errorMsg: errMsg});
            ApplyApproveUtils.emitter.emit('updateSelectedItem', {status: 'error',cancel: false});
        });
    };
    //获取下一节点的负责人
    this.getNextCandidate = function(queryObj,callback) {
        ApplyApproveAjax.getNextCandidate().sendRequest(queryObj).success((list) => {
            if (_.isArray(list)){
                checkIfLeader(list,(isLeader) => {
                    this.dispatch({list: list, isLeader: isLeader});
                });
                _.isFunction(callback) && callback(list);
            }
        }).error(
            this.dispatch({error: true})
        );
    };

    //把申请转给另外一个人
    this.transferNextCandidate = function(queryObj,callback) {
        this.dispatch({loading: true, error: false});
        ApplyApproveAjax.transferNextCandidate().sendRequest(queryObj).success((data) => {
            if (data){
                this.dispatch({loading: false, error: false});
                _.isFunction(callback) && callback(true);
            }else{
                this.dispatch({loading: false, error: true, errorMsg: Intl.get('apply.approve.transfer.failed','转出申请失败')});
                _.isFunction(callback) && callback(false);
            }
        }).error(errMsg => {
            this.dispatch({loading: false, error: true, errorMsg: errMsg});
            _.isFunction(callback) && callback(false);
        }
        );
    };

}
module.exports = alt.createActions(ApplyViewDetailActions);
