/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/18.
 */
var ApplyViewDetailAction = require('../action/apply-view-detail-action');
function ApplyViewDetailStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(ApplyViewDetailAction);
}
ApplyViewDetailStore.prototype.setInitState = function() {
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
        submitType: '',
        //错误信息
        errorMsg: ''
    };
};
//设置某条申请的回复列表
ApplyViewDetailStore.prototype.setApplyComment = function(list) {
    this.replyListInfo = {
        result: '',
        list: _.isArray(list) ? list : null,
        errorMsg: ''
    };
};
ApplyViewDetailStore.prototype.setInitialData = function(obj) {
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
ApplyViewDetailStore.prototype.getBusinessApplyDetailById = function(obj) {
    if (obj.error) {
        this.detailInfoObj.loadingResult = 'error';
        this.detailInfoObj.info = {};
        this.detailInfoObj.errorMsg = obj.errorMsg;
    } else {
        this.detailInfoObj.loadingResult = '';
        const info = obj.detail;
        _.each(info.apps || [], (app) => {
            app.app_id = app.client_id;
            app.app_name = app.client_name;
        });
        this.detailInfoObj.info = info;
        this.detailInfoObj.info = obj.detail;
        this.detailInfoObj.errorMsg = '';
        // this.createAppsSetting();
        // if(_.isArray(this.detailInfoObj.info.user_names)) {
        //     this.formData.user_name = this.detailInfoObj.info.user_names[0];
        // }
        // if(_.isArray(this.detailInfoObj.info.nick_names)) {
        //     this.formData.nick_name = this.detailInfoObj.info.nick_names[0];
        // }
        // let delayTime = 0;
        // if(this.detailInfoObj.info.type === 'apply_grant_delay'){
        //     if (this.detailInfoObj.info.delayTime) { // 同步修改时间
        //         delayTime = this.detailInfoObj.info.delayTime;
        //         this.formData.delay_time = delayTime;
        //         this.getDelayDisplayTime(delayTime);
        //     } else { // 到期时间，点开修改同步到自定义
        //         this.formData.delayTimeUnit = 'custom';
        //         this.formData.end_date = this.detailInfoObj.info.end_date;
        //     }
        // }
    }
};
//显示客户详情右侧面板
ApplyViewDetailStore.prototype.showCustomerDetail = function(customerId) {
    //是否显示右侧面板
    // this.showRightPanel = true;
    //右侧面板显示用户详情的customerId
    // this.rightPanelCustomerId = customerId;
    // //用户id为空
    // this.rightPanelUserId = '';
    // // 应用appId为空
    // this.rightPanelAppConfig = '';
};
ApplyViewDetailStore.prototype.getBusinessApplyCommentList = function(resultObj) {
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
ApplyViewDetailStore.prototype.setApplyFormDataComment = function(comment) {
    this.replyFormInfo.comment = comment;
};
ApplyViewDetailStore.prototype.hideReplyCommentEmptyError = function() {
    this.replyFormInfo.result = '';
    this.replyFormInfo.errorMsg = '';
};
//显示回复输入框为空的错误
ApplyViewDetailStore.prototype.showReplyCommentEmptyError = function() {
    // if(this.replyFormInfo.result === 'success') {
    //     return;
    // }
    this.replyFormInfo.result = 'error';
    this.replyFormInfo.errorMsg = Intl.get('user.apply.reply.no.content', '请填写回复内容');
};
ApplyViewDetailStore.prototype.addBusinessApplyComments = function(resultObj) {
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
ApplyViewDetailStore.prototype.approveApplyPassOrReject = function(obj) {
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
ApplyViewDetailStore.prototype.cancelSendApproval = function() {
    this.applyResult.submitResult = '';
    this.applyResult.errorMsg = '';
};


module.exports = alt.createStore(ApplyViewDetailStore, 'ApplyViewDetailStore');