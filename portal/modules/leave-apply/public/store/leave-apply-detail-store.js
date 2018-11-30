/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var LeaveApplyDetailAction = require('../action/leave-apply-detail-action');
var LeaveApplyAction = require('../action/leave-apply-action');
function LeaveApplyDetailStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(LeaveApplyDetailAction);
}
LeaveApplyDetailStore.prototype.setInitState = function() {
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
    //审批状态列表
    this.replyStatusInfo = {
        //三种状态,loading,error,''
        result: 'loading',
        //列表数组
        list: [],
        //服务端错误信息
        errorMsg: ''
    };
    this.backApplyResult = {
        loading: false,
        errorMsg: ''
    };
};
LeaveApplyDetailStore.prototype.setDetailInfoObj = function(detailObj) {
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
    //审批状态列表
    this.replyStatusInfo = {
        //三种状态,loading,error,''
        result: '',
        //列表数组
        list: [],
        //服务端错误信息
        errorMsg: ''
    };

};
//设置某条申请的回复列表
LeaveApplyDetailStore.prototype.setApplyComment = function(list) {
    this.replyListInfo = {
        result: '',
        list: _.isArray(list) ? _.concat(this.replyListInfo.list,list) : null,
        errorMsg: ''
    };
};
LeaveApplyDetailStore.prototype.setInitialData = function(obj) {
    //重置数据
    this.setInitState();
    //指定详情条目
    this.selectedDetailItem = obj;
    //设置底部类型
    // this.setBottomDisplayType();
    //是否是展开状态
    // this.applyIsExpanded = false;
};
//获取审批详情
LeaveApplyDetailStore.prototype.getLeaveApplyDetailById = function(obj) {
    if (obj.error) {
        this.detailInfoObj.loadingResult = 'error';
        this.detailInfoObj.info = {};
        this.detailInfoObj.errorMsg = obj.errorMsg;
    } else {
        this.detailInfoObj.loadingResult = '';
        //todo 是否展示通过和驳回的按钮
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
            LeaveApplyAction.updateAllApplyItemStatus(this.detailInfoObj.info);
        });

        this.detailInfoObj.errorMsg = '';
    }
};

LeaveApplyDetailStore.prototype.getLeaveApplyCommentList = function(resultObj) {
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
        //按回复时间进行排序
        replyListInfo.list = _.sortBy(replyListInfo.list, (item) => {
            return -item.comment_time;
        });
        replyListInfo.errorMsg = '';
    }
};
LeaveApplyDetailStore.prototype.setApplyFormDataComment = function(comment) {
    this.replyFormInfo.comment = comment;
};
LeaveApplyDetailStore.prototype.cancelApplyApprove = function(resultObj) {
    if (resultObj.loading){
        this.backApplyResult.loading = true;
        this.backApplyResult.errorMsg = '';
    }else if (resultObj.error){
        this.backApplyResult.loading = false;
        this.backApplyResult.errorMsg = resultObj.errorMsg;
    }else{
        this.backApplyResult.loading = false;
        this.backApplyResult.errorMsg = '';
    }
};
LeaveApplyDetailStore.prototype.hideCancelBtns = function() {
    this.selectedDetailItem.showCancelBtn = false;
    this.detailInfoObj.info.showCancelBtn = false;
};

LeaveApplyDetailStore.prototype.hideReplyCommentEmptyError = function() {
    this.replyFormInfo.result = '';
    this.replyFormInfo.errorMsg = '';
};
//显示回复输入框为空的错误
LeaveApplyDetailStore.prototype.showReplyCommentEmptyError = function() {
    // if(this.replyFormInfo.result === 'success') {
    //     return;
    // }
    this.replyFormInfo.result = 'error';
    this.replyFormInfo.errorMsg = Intl.get('user.apply.reply.no.content', '请填写回复内容');
};
LeaveApplyDetailStore.prototype.addLeaveApplyComments = function(resultObj) {
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
LeaveApplyDetailStore.prototype.approveLeaveApplyPassOrReject = function(obj) {
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
//获取审批的状态
LeaveApplyDetailStore.prototype.getLeaveApplyStatusById = function(obj) {
    if (obj.loading) {
        this.replyStatusInfo.result = 'loading';
        this.replyStatusInfo.errorMsg = '';
    } else if (obj.error) {
        this.replyStatusInfo.result = 'error';
        this.replyStatusInfo.errorMsg = obj.errorMsg;
    } else {
        this.replyStatusInfo.result = 'success';
        this.replyStatusInfo.errorMsg = '';
        this.replyStatusInfo.list = obj.list;
    }
};
LeaveApplyDetailStore.prototype.cancelSendApproval = function() {
    this.applyResult.submitResult = '';
    this.applyResult.errorMsg = '';
};
LeaveApplyDetailStore.prototype.hideApprovalBtns = function() {
    this.selectedDetailItem.showApproveBtn = false;
};


module.exports = alt.createStore(LeaveApplyDetailStore, 'LeaveApplyDetailStore');