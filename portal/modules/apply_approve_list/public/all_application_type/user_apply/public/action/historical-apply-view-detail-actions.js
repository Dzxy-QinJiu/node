import {getAllApplyLists} from '../../../../../public/ajax/apply_approve_list_ajax';
import AppUserAjax from '../ajax/app-user-ajax';
import AppUserUtil from '../util/app-user-util';
var ApplyApproveUtil = require('MOD_DIR/apply_approve_list/public/utils/apply_approve_utils');
import {APPLY_APPROVE_TYPES, APPLY_MULTI_TYPE_VALUES} from 'PUB_DIR/sources/utils/consts';
import {changeApplyStatusPassOrReject, updateUnapprovedCount} from 'PUB_DIR/sources/utils/common-method-util';
import ApplyApproveAjax from 'MOD_DIR/common/public/ajax/apply-approve';
import {checkIfLeader} from 'PUB_DIR/sources/utils/common-method-util';
import {addApplyComments, getApplyCommentList, getApplyDetailById,cancelApplyApprove} from 'PUB_DIR/sources/utils/apply-common-data-utils';
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
class ApplyViewDetailActions {
    constructor() {
        this.generateActions(
            //显示详情加载中
            'showDetailLoading',
            //取消审批
            'cancelSendApproval',
            //切换审批详情是否是展开的
            'toggleApplyExpanded',
            //将用户名设置为编辑状态
            'setUserNameEdit',
            //确定用户名
            'saveUserName',
            //取消用户名
            'cancelUserName',
            //将昵称设置为编辑状态
            'setNickNameEdit',
            //确定昵称
            'saveNickName',
            //取消昵称
            'cancelNickName',
            //显示用户详情
            'showUserDetail',
            //显示客户详情
            'showCustomerDetail',
            // 延期时间设置为可修改
            'setDelayTimeModify',
            // 保存延期时间的修改
            'saveModifyDelayTime',
            // 取消延期时间的修改
            'cancelModifyDelayTime',
            // 延迟时间
            'delayTimeNumberModify',
            // 延迟单位，比如：天、周、月、年
            'delayTimeUnitModify',
            //关闭右侧面板
            'closeRightPanel',
            //显示回复输入框为空的错误
            'showReplyCommentEmptyError',
            //隐藏回复输入框为空的错误
            'hideReplyCommentEmptyError',
            //恢复添加回复表单到默认状态
            'resetReplyFormResult',
            //角色没有设置的时候是否显示模态框
            'setRolesNotSettingModalDialog',
            // 显示应用配置面板
            'showAppConfigPanel',
            'showAppConfigRightPanle',
            // 应用配置取消时
            'handleCancel',
            // 应用配置保存成功时
            'handleSaveAppConfig',
            // 将延期时间设置为截止时间（具体到xx年xx月xx日）
            'setDelayDeadlineTime',
            'setBottomDisplayType',
            'hideApprovalBtns',//审批完后不在显示审批按钮
            'setNextCandidateIds',//设置下一节点的审批人
            'setNextCandidateName',//下一节点审批人的名字
            'setNextCandidate',
            'showOrHideApprovalBtns',
            'setHistoryApplyStatus',
            'setAppsSetting', // 设置应用的配置信息
        );
    }

    //获取审批单详情
    getApplyDetail(queryObj, status, applyData) {
        if (applyData){
            this.dispatch({loading: false, error: false, detail: applyData.detail, status: status});
            AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.GET_HISTORICAL_APPLY_DETAIL_CUSTOMERID,_.get(applyData,'detail',''));
        }else{
            getApplyDetailById(queryObj).then((detail) => {
                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.GET_HISTORICAL_APPLY_DETAIL_CUSTOMERID,detail);
                this.dispatch({loading: false, error: false, detail: detail, status: status});
            }, (errorMsg) => {
                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.GET_HISTORICAL_APPLY_DETAIL_CUSTOMERID);
                this.dispatch({loading: false, error: true, errorMsg: errorMsg || Intl.get('user.get.apply.detail.failed', '获取申请审批详情失败')});
            });
        }
    }
    //在审批详情中得到客户的id，然后根据客户的id获取历史申请审批
    getHistoryApplyListsByCustomerId(apply){
        this.dispatch({loading: true, error: false});
        getAllApplyLists({customer_id: _.get(apply,'customer_id',''), page_size: 100, type: APPLY_APPROVE_TYPES.USER_OR_GRANT}).then((data) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            //过滤掉本条申请
            data.list = _.filter(data.list, item => item.id !== _.get(apply, 'id',''));
            this.dispatch({error: false, loading: false, data: data});
        },(errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get('apply.failed.get.type.application', '获取全部{type}申请失败', {type: Intl.get('crm.detail.user', '用户')})
            });});
    }

    //获取回复列表
    getReplyList(id) {
        this.dispatch({loading: true, error: false, list: [], errorMsg: ''});
        getApplyCommentList({id: id}).then((list) => {
            this.dispatch({loading: false, error: false, list: list, errorMsg: ''});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, list: [], errorMsg: errorMsg});
        });
    }

    //提交审批
    submitApply(obj, type, callback) {
        this.dispatch({loading: true, error: false});
        let promise = null;
        //延期、停用审批用新接口
        if (_.includes(APPLY_MULTI_TYPE_VALUES, type)) {
            promise = AppUserAjax.submitMultiAppApply({
                data: obj
            });
        }
        else {
            promise = AppUserAjax.submitApply(obj);
        }
        promise.then((data) => {
            if(data.approveFlag){//approveFlag 审批成功或失败
                this.dispatch({loading: false, error: false});
                _.isFunction(callback) && callback();
                changeApplyStatusPassOrReject(obj,data);
            }else{
                this.dispatch({loading: false, error: true, errorMsg: Intl.get('errorcode.19', '审批申请失败')});
            }

        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    }

    //添加回复
    addReply(obj,callback) {
        this.dispatch({loading: true, error: false});
        addApplyComments(obj).then((replyData) => {
            if (_.isObject(replyData)) {
                //滚动条定位到最后
                AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.REPLY_LIST_SCROLL_TO_BOTTOM);
                this.dispatch({loading: false, error: false, reply: replyData});
                _.isFunction(callback) && callback();
            }
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    }

    // 撤销申请
    cancelApplyApprove(obj) {
        var errTip = Intl.get('user.apply.detail.backout.error', '撤销申请失败');
        this.dispatch({loading: true, error: false});
        cancelApplyApprove(obj).then((data) => {
            if (data) {
                this.dispatch({loading: false, error: false});
                ApplyApproveUtil.emitter.emit('updateSelectedItem', {id: obj.id, cancel: true, status: 'success'});
                //刷新用户审批未处理数(左侧导航中待审批数)
                // if (Oplate && Oplate.unread) {
                //     var count = Oplate.unread.approve - 1;
                //     updateUnapprovedCount('approve','SHOW_UNHANDLE_APPLY_COUNT',count);
                // }
            }else{
                this.dispatch({loading: false, error: true, errorMsg: errTip});
                ApplyApproveUtil.emitter.emit('updateSelectedItem', {status: 'error',cancel: false});
            }
        }, (errorMsg) => {
            var errMsg = errorMsg || errTip;
            this.dispatch({loading: false, error: true, errorMsg: errMsg});
            ApplyApproveUtil.emitter.emit('updateSelectedItem', {status: 'error',cancel: false});
            this.dispatch(errorMsg);
        });
    }

    //获取下一节点的负责人
    getNextCandidate(queryObj,callback) {
        ApplyApproveAjax.getNextCandidate().sendRequest(queryObj).success((list) => {
            if (_.isArray(list)){
                checkIfLeader(list,(isLeader) => {
                    this.dispatch({list: list, isLeader: isLeader});
                });
                _.isFunction(callback) && callback(list);
            }
        }).error(this.dispatch({error: true}));
    }
    //获取该审批所在节点
    getApplyTaskNode(queryObj){
        ApplyApproveAjax.getApplyTaskNode().sendRequest(queryObj).success((list) => {
            if (_.isArray(list)) {
                this.dispatch(list);
            }
        }).error(this.dispatch({error: true}));
    }

    transferNextCandidate(queryObj, callback) {
        this.dispatch({loading: true, error: false});
        ApplyApproveAjax.transferNextCandidate().sendRequest(queryObj).success((data) => {
            if (data) {
                this.dispatch({loading: false, error: false});
                _.isFunction(callback) && callback(true);
            } else {
                this.dispatch({
                    loading: false,
                    error: true,
                    errorMsg: Intl.get('apply.approve.transfer.failed', '转出申请失败')
                });
                _.isFunction(callback) && callback(false);
            }
        }).error(errMsg => {
            this.dispatch({loading: false, error: true, errorMsg: errMsg});
            _.isFunction(callback) && callback(false);
        }
        );
    }

}

export default alt.createActions(ApplyViewDetailActions);
