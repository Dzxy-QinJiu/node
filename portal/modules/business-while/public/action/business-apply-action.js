import {getAllApplyList, getWorklistApplyList} from 'PUB_DIR/sources/utils/apply-common-data-utils';

/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var BusinessApplyAjax = require('../ajax/business-apply-ajax');
let userData = require('PUB_DIR/sources/user-data');
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {APPLY_APPROVE_TYPES, APPLY_TYPE_STATUS_CONST} from 'PUB_DIR/sources/utils/consts';
import ApplyApproveAjax from '../../../common/public/ajax/apply-approve';
import applyPrivilegeConst from 'MOD_DIR/apply_approve_manage/public/privilege-const';
import {SELF_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import homePagePrivilegeConst from 'MOD_DIR/home_page/public/privilege-const';
function BusinessApplyActions() {
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
        ''
    );
    this.getAllApplyList = function(queryObj,callback) {
        //需要先获取待审批列表，成功后获取全部列表
        this.dispatch({loading: true, error: false});
        //如果选中的是我审批过的
        if (queryObj.status === APPLY_TYPE_STATUS_CONST.MYAPPROVED){
            delete queryObj.status;
            getApplyListApprovedByMe.bind(this,queryObj)();
        }else if (queryObj.status === APPLY_TYPE_STATUS_CONST.ONGOING || !queryObj.status){
            //如果是全部申请，要先取一下待我审批的列表
            getWorklistApplyList({type: APPLY_APPROVE_TYPES.BUSINESSTRIPAWHILE}).then((workList) => {
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
                    errMsg: errorMsg || Intl.get('apply.failed.get.my.worklist.application', '获取待我审批的{type}申请失败', {type: Intl.get('business.while.trip.go.out', '外出')})
                });
            });
        }else{
            getDiffTypeApplyList(this,queryObj);
        }
    };
}
//获取我审批过的列表
function getApplyListApprovedByMe(queryObj) {
    ApplyApproveAjax.getApplyListApprovedByMe().sendRequest(queryObj).success((data) => {
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        this.dispatch({error: false, loading: false, data: data});
    }).error(xhr => {
        this.dispatch({
            error: true,
            loading: false,
            errorMsg: xhr.responseJSON || Intl.get('apply.has.approved.by.me', '获取我审批过的{type}申请失败', {type: Intl.get('business.while.trip.go.out', '外出')})
        });
    }
    );
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
            if (item.status === 'ongoing' && _.get(item,'applicant.user_id') === userData.getUserData().user_id && hasPrivilege(homePagePrivilegeConst.BASE_QUERY_PERMISSION_MEMBER)){
                item.showCancelBtn = true;
            }
        });
        that.dispatch({error: false, loading: false, data: data});
    },(errorMsg) => {
        that.dispatch({
            error: true,
            loading: false,
            errMsg: errorMsg || Intl.get('apply.failed.get.type.application', '获取全部{type}申请失败',{type: Intl.get('business.while.trip.go.out', '外出')})
        });});

}
module.exports = alt.createActions(BusinessApplyActions);