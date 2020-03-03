import UserAjax from '../ajax/apply_approve_list_ajax';
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
let userData = require('PUB_DIR/sources/user-data');
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
        'afterAddApplySuccess'//添加申请审批成功后的处理
    );
    // //获取申请列表
    // this.getApplyList = function(obj, callback) {
    //     this.dispatch({loading: true, error: false});
    //     if (_.includes(['all','false'], obj.approval_state)){
    //         ApplyApproveAjax.getMyUserApplyWorkList().sendRequest({keyword: obj.keyword}).success((workList) => {
    //             //如果是待我审批的列表，不需要在发获取全部列表的请求了
    //             if (obj.approval_state && obj.approval_state === 'false') {
    //                 //需要对全部列表都加一个可以审批的属性
    //                 workList.total = workList.list.length;
    //                 _.forEach(workList.list, (workItem) => {
    //                     workItem.showApproveBtn = true;
    //                     //如果是我申请的，除了可以审批之外，我也可以撤回
    //                     if (_.get(workItem, 'applicant.user_id') === userData.getUserData().user_id) {
    //                         workItem.showCancelBtn = true;
    //                     }
    //                 });
    //                 this.dispatch({error: false, loading: false, data: workList});
    //                 _.isFunction(callback) && callback(workList.total);
    //                 return;
    //             }
    //             getDiffTypeApplyList(this,obj,workList.list);
    //         }).error(xhr => {
    //             this.dispatch({
    //                 error: true,
    //                 loading: false,
    //                 errorMsg: xhr.responseJSON || Intl.get('apply.failed.get.my.worklist.application', '获取待我审批的{type}申请失败', {type: Intl.get('crm.detail.user', '用户')})
    //             });
    //         }
    //         );
    //     }else{
    //         getDiffTypeApplyList(this,obj);
    //     }
    // };







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
        // if (applyData){
        //     this.dispatch({loading: false, error: false, detail: applyData.detail, status: status});
        // }else{
        getApplyDetailById({id: applyId}).then((detail) => {
            this.dispatch({loading: false, error: false, detail: detail, status: status});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
        // }
    };
    //申请用户
    this.applyUser = function(obj, cb) {
        UserAjax.applyUser(obj).then(function(data) {
            cb(data);
        }, function(errorMsg) {
            cb(errorMsg);
        });
    };
}
function getDiffTypeApplyList(that,queryObj,workListArr) {
    UserAjax.getApplyList(queryObj).then((data) => {
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        //需要对全部列表进行一下处理，知道哪些是可以审批的
        if (_.isArray(workListArr) && workListArr.length){
            _.forEach(workListArr,(item) => {
                var targetObj = _.find(data.list,(dataItem) => {
                    return item.id === dataItem.id;
                });
                if (targetObj){
                    targetObj.showApproveBtn = true;
                }
            });
        }
        //给 自己申请的并且是未通过的审批加上可以撤销的标识
        _.forEach(data.list,(item) => {
            if (item.status === 'false' && _.get(item,'applicant.user_id') === userData.getUserData().user_id){
                item.showCancelBtn = true;
            }
        });
        that.dispatch({error: false, loading: false, data: data});
    },(errorMsg) => {
        that.dispatch({
            error: true,
            loading: false,
            errorMsg: errorMsg || Intl.get('apply.failed.get.type.application', '获取全部{type}申请失败', {type: Intl.get('crm.detail.user', '用户')})
        });});
}

module.exports = alt.createActions(UserApplyActions);
