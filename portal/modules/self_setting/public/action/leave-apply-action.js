/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
let userData = require('PUB_DIR/sources/user-data');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
import {getAllApplyList,getWorklistApplyList} from 'PUB_DIR/sources/utils/apply-common-data-utils';
var applyApproveManageAjax = require('../ajax/leave-apply-ajax');
function LeaveApplyActions() {
    this.generateActions(
        'setInitState',
        'setSelectedDetailItem',//点击某个申请
        'changeApplyListType',
        'changeApplyAgreeStatus',//审批完后改变出差申请的状态
        'afterAddApplySuccess',
        'updateAllApplyItemStatus',
        'afterTransferApplySuccess',
        'setLastApplyId',
        'setShowUpdateTip',
        'setIsCheckUnreadApplyList',
        'refreshUnreadReplyList',//刷新未读回复列表
        'clearUnreadReply'
    );
    this.getAllLeaveApplyList = function(queryObj,callback) {
        //需要先获取待审批列表，成功后获取全部列表
        this.dispatch({loading: true, error: false});
        //如果是全部申请，要先取一下待我审批的列表
        if (queryObj.status === 'ongoing' || !queryObj.status){
            //todo type就是自定义流程上的type
            var workFlowConfigs = userData.getUserData().workFlowConfigs;
            getWorklistApplyList({type: _.get(workFlowConfigs,'[0].type')}).then((workList) => {
                //如果是待我审批的列表，不需要在发获取全部列表的请求了
                if (queryObj.status && queryObj.status === 'ongoing'){
                    //需要对全部列表都加一个可以审批的属性
                    _.forEach(workList.list,(workItem) => {
                        workItem.showApproveBtn = true;
                        //如果是我申请的，除了可以审批之外，我也可以撤回
                        if (_.get(workItem,'applicant.user_id') === userData.getUserData().user_id && hasPrivilege('GET_MY_WORKFLOW_LIST')){
                            workItem.showCancelBtn = true;
                        }
                    });
                    this.dispatch({error: false, loading: false, data: workList});
                    _.isFunction(callback) && callback(workList.total);
                    return;
                }
                getDiffTypeApplyList(this,queryObj,workList.list);
            }, (errorMsg) => {
                this.dispatch({
                    error: true,
                    loading: false,
                    errMsg: errorMsg || Intl.get('apply.failed.get.my.worklist.application', '获取待我审批的{type}申请失败', {type: Intl.get('weekly.report.ask.for.leave', '请假')})
                });
            });
        }else{
            getDiffTypeApplyList(this,queryObj);
        }
    };
    this.addSelfSettingApply = function(submitObj,callback) {
        this.dispatch({error: false, loading: true});
        applyApproveManageAjax.addSelfSettingApply(submitObj).then((result) => {
            this.dispatch({error: false, loading: false});
            _.isFunction(callback) && callback(result);
        }, (errorMsg) => {
            this.dispatch({error: true, loading: false, errorMsg: errorMsg});

        });
    };

}
function getDiffTypeApplyList(that,queryObj,workListArr) {
    getAllApplyList(queryObj).then((data) => {
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
            if (item.status === 'ongoing' && _.get(item,'applicant.user_id') === userData.getUserData().user_id && hasPrivilege('GET_MY_WORKFLOW_LIST')){
                item.showCancelBtn = true;
            }
        });
        that.dispatch({error: false, loading: false, data: data});
    },(errorMsg) => {
        that.dispatch({
            error: true,
            loading: false,
            errMsg: errorMsg || Intl.get('failed.get.all.leave.list','获取全部请假申请失败')
        });});

}
module.exports = alt.createActions(LeaveApplyActions);