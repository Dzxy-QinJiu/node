/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var ReportSendApplyDetailAction = require('../action/report-send-apply-detail-action');
var applyApproveListAction = require('../../../../action/apply_approve_list_action');
import {checkIfLeader} from 'PUB_DIR/sources/utils/common-method-util';
function ReportSendApplyDetailStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(ReportSendApplyDetailAction);
}
ReportSendApplyDetailStore.prototype.setInitState = function() {
    //选中的审批条目
    this.selectedDetailItem = {};
    //审批的详情数据
    this.detailInfoObj = {
        // "" loading error
        loadingResult: 'loading',
        //获取的详情信息
        info: {},
        //错误信息
        errorMsg: ''
    };
    //回复列表
    this.replyListInfo = {
        //三种状态,loading,error,''
        result: 'loading',
        //列表数组
        list: [],
        //服务端错误信息
        errorMsg: ''
    };
    //回复表单
    this.replyFormInfo = {
        //三种状态,loading,error,success,''
        result: '',
        //服务端错误信息
        errorMsg: '',
        comment: '',
    };
    //审批之后数据存储
    this.applyResult = {
        //提交状态  "" loading error success
        submitResult: '',
        //错误信息
        errorMsg: ''
    };
    this.backApplyResult = {
        //提交状态  "" loading error success
        submitResult: '',
        errorMsg: ''
    };
    this.deleteResult = {
        result: 'loading',
        delId: '',//被删除的那个文件的文件id
        errorMsg: ''
    };
    //转出申请的状态列表
    this.transferStatusInfo = {
        //三种状态,loading,error,''
        result: '',
        //服务端错误信息
        errorMsg: ''
    };
    this.isLeader = false; //当前账号是否是待审批人的上级领导
    this.applyNode = [];
    //下一节点负责人的列表
    this.candidateList = [];
};
ReportSendApplyDetailStore.prototype.setDetailInfoObjAfterAdd = function(detailObj) {
    delete detailObj.afterAddReplySuccess;
    this.detailInfoObj = {
        // "" loading error
        loadingResult: '',
        //获取的详情信息
        info: detailObj,
        //错误信息
        errorMsg: ''
    };
    this.replyListInfo = {
        //三种状态,loading,error,''
        result: '',
        //列表数组
        list: [],
        //服务端错误信息
        errorMsg: ''
    };
    //下一节点负责人的列表
    this.candidateList = [];
};
ReportSendApplyDetailStore.prototype.setDetailInfo = function(detailObj) {
    this.detailInfoObj = {
        // "" loading error
        loadingResult: '',
        //获取的详情信息
        info: detailObj,
        //错误信息
        errorMsg: ''
    };
};
//设置某条申请的回复列表
ReportSendApplyDetailStore.prototype.setApplyComment = function(list) {
    this.replyListInfo = {
        result: '',
        list: _.isArray(list) ? _.concat(this.replyListInfo.list,list) : null,
        errorMsg: ''
    };
};
ReportSendApplyDetailStore.prototype.getApplyTaskNode = function(result){
    if (result.error) {
        this.applyNode = [];
    } else {
        this.applyNode = result;
    }
};
ReportSendApplyDetailStore.prototype.setInitialData = function(obj) {
    //重置数据
    this.setInitState();
    //指定详情条目
    this.selectedDetailItem = obj;
};
//获取审批详情
ReportSendApplyDetailStore.prototype.getApplyDetailById = function(obj) {
    if (obj.error) {
        this.detailInfoObj.loadingResult = 'error';
        this.detailInfoObj.info = {};
        this.detailInfoObj.errorMsg = obj.errorMsg;
    } else {
        this.detailInfoObj.loadingResult = '';
        //是否展示通过和驳回的按钮
        this.detailInfoObj.info = obj.detail;
        if (obj.status){
            //审批通过或者驳回后立刻查询状态还没有立刻改变
            this.detailInfoObj.info.status = obj.status;
            this.selectedDetailItem.status = obj.status;
        }
        this.detailInfoObj.info.showApproveBtn = this.selectedDetailItem.showApproveBtn;
        this.detailInfoObj.info.showCancelBtn = this.selectedDetailItem.showCancelBtn;
        //列表中那一申请的状态以这个为准，因为申请完就不一样了
        setTimeout(() => {
            applyApproveListAction.updateAllApplyItemStatus(this.detailInfoObj.info);
        });

        this.detailInfoObj.errorMsg = '';
    }
};

ReportSendApplyDetailStore.prototype.getApplyCommentList = function(resultObj) {
    //回复列表
    var replyListInfo = this.replyListInfo;
    //result,list,errorMsg
    //loading的情况
    if (resultObj.loading) {
        replyListInfo.result = 'loading';
        replyListInfo.list = [];
        replyListInfo.errorMsg = '';
    } else if (resultObj.error) {
        //出错的情况
        replyListInfo.result = 'error';
        replyListInfo.list = [];
        replyListInfo.errorMsg = resultObj.errorMsg;
    } else {
        //正常情况
        replyListInfo.result = '';
        replyListInfo.list = resultObj.list;
        replyListInfo.errorMsg = '';
    }
};
ReportSendApplyDetailStore.prototype.setApplyFormDataComment = function(comment) {
    this.replyFormInfo.comment = comment;
};
ReportSendApplyDetailStore.prototype.cancelApplyApprove = function(resultObj) {
    if (resultObj.loading){
        this.backApplyResult.submitResult = 'loading';
        this.backApplyResult.errorMsg = '';
    }else if (resultObj.error){
        this.backApplyResult.submitResult = 'error';
        this.backApplyResult.errorMsg = resultObj.errorMsg;
    }else{
        this.backApplyResult.submitResult = 'success';
        this.backApplyResult.errorMsg = '';
        this.hideCancelBtns();
        this.showOrHideApprovalBtns();
    }
};
ReportSendApplyDetailStore.prototype.hideCancelBtns = function() {
    this.selectedDetailItem.showCancelBtn = false;
    this.detailInfoObj.info.showCancelBtn = false;
};
ReportSendApplyDetailStore.prototype.showOrHideApprovalBtns = function(flag){
    this.selectedDetailItem.showApproveBtn = flag;
    this.detailInfoObj.info.showApproveBtn = flag;
};
ReportSendApplyDetailStore.prototype.setNextCandidate = function(candidateArr){
    this.candidateList = candidateArr;
    checkIfLeader(candidateArr,(isLeader) => {
        this.isLeader = isLeader;
    });
};
ReportSendApplyDetailStore.prototype.setNextCandidateName = function(candidateName){
    this.detailInfoObj.info.nextCandidateName = candidateName;
};
ReportSendApplyDetailStore.prototype.hideReplyCommentEmptyError = function() {
    this.replyFormInfo.result = '';
    this.replyFormInfo.errorMsg = '';
};
//显示回复输入框为空的错误
ReportSendApplyDetailStore.prototype.showReplyCommentEmptyError = function() {
    // if(this.replyFormInfo.result === 'success') {
    //     return;
    // }
    this.replyFormInfo.result = 'error';
    this.replyFormInfo.errorMsg = Intl.get('user.apply.reply.no.content', '请填写回复内容');
};
ReportSendApplyDetailStore.prototype.addApplyComments = function(resultObj) {
    //回复表单
    var replyFormInfo = this.replyFormInfo;
    if (resultObj.loading) {
        replyFormInfo.result = 'loading';
        replyFormInfo.errorMsg = '';
    } else if (resultObj.error) {
        replyFormInfo.result = 'error';
        replyFormInfo.errorMsg = resultObj.errorMsg;
    } else {
        replyFormInfo.result = 'success';
        replyFormInfo.errorMsg = '';
        var replyItem = resultObj.reply;
        this.replyListInfo.list.push(replyItem);
        //输入框清空
        replyFormInfo.comment = '';
    }
};
//提交审批
ReportSendApplyDetailStore.prototype.approveApplyPassOrReject = function(obj) {
    if (obj.loading) {
        this.applyResult.submitResult = 'loading';
        this.applyResult.errorMsg = '';
    } else if (obj.error) {
        this.applyResult.submitResult = 'error';
        this.applyResult.errorMsg = obj.errorMsg;
    } else {
        this.applyResult.submitResult = 'success';
        this.applyResult.errorMsg = '';
    }
};

ReportSendApplyDetailStore.prototype.cancelSendApproval = function() {
    this.applyResult.submitResult = '';
    this.applyResult.errorMsg = '';
    this.backApplyResult.submitResult = '';
    this.backApplyResult.errorMsg = '';
};
ReportSendApplyDetailStore.prototype.hideApprovalBtns = function() {
    this.selectedDetailItem.showApproveBtn = false;
    this.selectedDetailItem.showCancelBtn = false;
};
ReportSendApplyDetailStore.prototype.getNextCandidate = function(result) {
    if (result.error){
        this.candidateList = [];
    }else{
        this.candidateList = _.get(result,'list',[]);
        this.isLeader = _.get(result,'isLeader',false);
    }
};
ReportSendApplyDetailStore.prototype.setUpdateFilesLists = function(updateLists) {
    this.detailInfoObj.info.detail.file_upload_logs = updateLists;
};
ReportSendApplyDetailStore.prototype.setNextCandidateIds = function(candidateId) {
    this.detailInfoObj.info.nextCandidateId = candidateId;
};
ReportSendApplyDetailStore.prototype.transferNextCandidate = function(result) {
    if (result.loading) {
        this.transferStatusInfo.result = 'loading';
        this.transferStatusInfo.errorMsg = '';
    } else if (result.error) {
        this.transferStatusInfo.result = 'error';
        this.transferStatusInfo.errorMsg = result.errorMsg;
    } else {
        this.transferStatusInfo.result = 'success';
        this.transferStatusInfo.errorMsg = '';
        //如果转出成功，要隐藏审批的按钮
        this.selectedDetailItem.showApproveBtn = false;
        this.detailInfoObj.info.showApproveBtn = false;
    }
};

module.exports = alt.createStore(ReportSendApplyDetailStore, 'ReportSendApplyDetailStore');
