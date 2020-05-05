import UserAjax from '../ajax/apply_approve_list_ajax';
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
import ApplyApproveAjax from '../../../common/public/ajax/apply-approve';
import {getApplyDetailById} from 'PUB_DIR/sources/utils/apply-common-data-utils';
import {addCancelBtnPrivliege} from '../utils/apply_approve_utils';
/**
 * 用户审批界面使用的action
 */
function UserApplyActions() {
    this.generateActions(
        'resetState',//切换tab的时候清除数据
        'setLastApplyId', //设置当前展示列表中最后一个id
        'changeSearchInputValue',//修改搜索框的值
        'changeApplyStatus',//修改申请审批的状态
        'changeApplyType',//修改申请审批的类型
        'setSelectedDetailItem',//设置当前要查看详情的申请
        'setShowUpdateTip',//设置是否展示更新提示
        'getApplyById',//根据id获取申请（实际是获取申请的详情）
        // 'refreshUnreadReplyList',//刷新未读回复列表
        'refreshMyUnreadReplyList',//刷新未读回复列表
        'refreshTeamUnreadReplyList',//刷新未读回复列表
        'clearUnreadReply',//清除未读回复列表中已读的回复
        'updateDealApplyError',//更新处理申请错误的状态
        'setIsCheckUnreadApplyList',//设置是否查看有未读回复的申请列表
        'backApplySuccess',
        'afterTransferApplySuccess',//转审成功后的处理
        'afterAddApplySuccess',//添加申请审批成功后的处理
        'changeApplyAgreeStatus',//审批完后更改审批的状态
        'updateAllApplyItemStatus'
    );
    //获取由我发起的申请列表
    this.getApplyListStartSelf = function(obj) {
        this.dispatch({loading: true, error: false});
        UserAjax.getApplyListStartSelf(obj).then((result) => {
            addCancelBtnPrivliege(result.list);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, data: result });
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取我的申请列表
    this.getMyApplyLists = function(obj) {
        this.dispatch({loading: true, error: false});
        UserAjax.getMyApplyLists(obj).then((result) => {
            addCancelBtnPrivliege(result.list);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, data: result });
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取所有申请列表
    this.getAllApplyLists = function(obj) {
        this.dispatch({loading: true, error: false});
        UserAjax.getAllApplyLists(obj).then((result) => {
            addCancelBtnPrivliege(result.list);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, data: result });
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //根据id获取申请
    this.getApplyById = function(applyId) {
        this.dispatch({loading: true, error: false});
        var _this = this;
        //实际是获取详情组织申请项
        UserAjax.getApplyDetail(applyId).then(function(detail, apps) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch({loading: false, error: false, data: {detail: detail, apps: apps}});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
        getApplyDetailById({id: applyId}).then((detail) => {
            this.dispatch({loading: false, error: false, detail: detail, status: status});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

}

module.exports = alt.createActions(UserApplyActions);
