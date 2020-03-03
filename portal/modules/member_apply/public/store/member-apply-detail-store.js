/**
 * Created by hzl on 2019/3/5.
 */

var MemberApplyDetailAction = require('../action/member-apply-detail-action');
var MemberApplyAction = require('../action/member-apply-action');

function MemberApplyDetailStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(MemberApplyDetailAction);
}
MemberApplyDetailStore.prototype.setInitState = function() {
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
    //转出申请的状态列表
    this.transferStatusInfo = {
        //三种状态,loading,error,''
        result: '',
        //服务端错误信息
        errorMsg: ''
    };
    this.nameExist = false;// 姓名是否已存在
    this.nameError = false;// 姓名唯一性验证出错
    this.checkNameError = false; // 校验姓名出错，默认false
    this.checkEmailError = false; // 校验邮箱出错，默认false
    this.emailExist = false;// 邮箱是否已存在
    this.emailError = false;// 邮件唯一性验证出错
    this.autoGenerationPsd = true; // 是否自动生成密码，默认true
    this.password = '';// 手动输入申请成员的密码，默认是空
    this.applyNode = [];
};
MemberApplyDetailStore.prototype.setDetailInfoObjAfterAdd = function(detailObj) {
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
//设置某条申请的回复列表
MemberApplyDetailStore.prototype.setApplyComment = function(list) {
    this.replyListInfo = {
        result: '',
        list: _.isArray(list) ? _.concat(this.replyListInfo.list,list) : null,
        errorMsg: ''
    };
};
MemberApplyDetailStore.prototype.setInitialData = function(obj) {
    //重置数据
    this.setInitState();
    //指定详情条目
    this.selectedDetailItem = obj;
};
//获取审批详情
MemberApplyDetailStore.prototype.getMemberApplyDetailById = function(obj) {
    if (obj.error) {
        this.detailInfoObj.loadingResult = 'error';
        this.detailInfoObj.info = {};
        this.detailInfoObj.errorMsg = obj.errorMsg;
    } else {
        this.detailInfoObj.loadingResult = '';
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
            MemberApplyAction.updateAllApplyItemStatus(this.detailInfoObj.info);
        });

        this.detailInfoObj.errorMsg = '';
    }
};

MemberApplyDetailStore.prototype.getMemberApplyCommentList = function(resultObj) {
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
MemberApplyDetailStore.prototype.setApplyFormDataComment = function(comment) {
    this.replyFormInfo.comment = comment;
};
MemberApplyDetailStore.prototype.cancelApplyApprove = function(resultObj) {
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
MemberApplyDetailStore.prototype.hideCancelBtns = function() {
    this.selectedDetailItem.showCancelBtn = false;
    this.detailInfoObj.info.showCancelBtn = false;
};
MemberApplyDetailStore.prototype.showOrHideApprovalBtns = function(flag){
    this.selectedDetailItem.showApproveBtn = flag;
    this.detailInfoObj.info.showApproveBtn = flag;
};
MemberApplyDetailStore.prototype.setNextCandidate = function(candidateArr){
    this.candidateList = candidateArr;
};
MemberApplyDetailStore.prototype.setNextCandidateName = function(candidateName){
    this.detailInfoObj.info.nextCandidateName = candidateName;
};

MemberApplyDetailStore.prototype.hideReplyCommentEmptyError = function() {
    this.replyFormInfo.result = '';
    this.replyFormInfo.errorMsg = '';
};
//显示回复输入框为空的错误
MemberApplyDetailStore.prototype.showReplyCommentEmptyError = function() {
    this.replyFormInfo.result = 'error';
    this.replyFormInfo.errorMsg = Intl.get('user.apply.reply.no.content', '请填写回复内容');
};
MemberApplyDetailStore.prototype.addMemberApplyComments = function(resultObj) {
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
MemberApplyDetailStore.prototype.approveMemberApplyPassOrReject = function(obj) {
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

MemberApplyDetailStore.prototype.cancelSendApproval = function() {
    this.applyResult.submitResult = '';
    this.applyResult.errorMsg = '';
    this.backApplyResult.submitResult = '';
    this.backApplyResult.errorMsg = '';
};
MemberApplyDetailStore.prototype.hideApprovalBtns = function() {
    this.selectedDetailItem.showApproveBtn = false;
    this.selectedDetailItem.showCancelBtn = false;
};
MemberApplyDetailStore.prototype.getNextCandidate = function(result) {
    if (result.error){
        this.candidateList = [];
    }else{
        this.candidateList = _.get(result,'list',[]);
        this.isLeader = _.get(result,'isLeader',false);
    }
};
MemberApplyDetailStore.prototype.setNextCandidateIds = function(candidateId) {
    this.detailInfoObj.info.nextCandidateId = candidateId;
};
MemberApplyDetailStore.prototype.transferNextCandidate = function(result) {
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
//姓名唯一性的验证
MemberApplyDetailStore.prototype.checkOnlyName = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.nameError = true;
    } else {
        //该昵称存不存在！
        this.nameExist = result;
    }
};
MemberApplyDetailStore.prototype.setCheckNameErrorFlag = function(flag) {
    this.checkNameError = flag;
};
//邮箱唯一性的验证
MemberApplyDetailStore.prototype.checkOnlyEmail = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.emailError = true;
    } else {
        //该邮箱存不存在！
        this.emailExist = result;
    }
};
MemberApplyDetailStore.prototype.setCheckEmailErrorFlag = function(flag) {
    this.checkEmailError = flag;
};

// 重置姓名验证的标志
MemberApplyDetailStore.prototype.resetNameFlags = function() {
    this.nameExist = false;
    this.nameError = false;
};

// 重置邮箱验证的标志
MemberApplyDetailStore.prototype.resetEmailFlags = function() {
    this.emailExist = false;
    this.emailError = false;
};

// 检查是否自动生成密码
MemberApplyDetailStore.prototype.checkAutoGeneration = function(check) {
    this.autoGenerationPsd = check;
};
// 处理手动输入密码
MemberApplyDetailStore.prototype.handleInputPassword = function(value) {
    this.password = value;
};
MemberApplyDetailStore.prototype.getApplyTaskNode = function(result){
    if (result.error) {
        this.applyNode = [];
    } else {
        this.applyNode = result;
    }
};

module.exports = alt.createStore(MemberApplyDetailStore, 'MemberApplyDetailStore');
