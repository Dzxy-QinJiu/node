/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var DocumentWriteAjax = require('../ajax/document-write-apply-ajax');
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
let userData = require('PUB_DIR/sources/user-data');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
function ReportSendApplyActions() {
    this.generateActions(
        'setInitState',
        'setSelectedDetailItem',//点击某个申请
        'changeApplyListType',
        'changeApplyAgreeStatus',//审批完后改变出差申请的状态
        'afterAddApplySuccess',
        'updateAllApplyItemStatus'
    );
    this.getAllLeaveApplyList = function(queryObj) {
        //需要先获取待审批列表，成功后获取全部列表
        this.dispatch({loading: true, error: false});
        DocumentWriteAjax.getWorklistLeaveApplyList({type: APPLY_APPROVE_TYPES.OPINIONREPORT}).then((workList) => {
            this.dispatch({workList: workList});
            //如果是待我审批的列表，不需要在发获取全部列表的请求了
            if (queryObj.status && queryObj.status === 'ongoing'){
                //需要对全部列表都加一个可以审批的属性
                //舆情报送的审批和文件撰写的审批是一个接口，获取回来的是两类数据，需要在前端进行过滤
                //这个接口不是下拉加载，是一次全部取出，所以需要把total的值也一起改掉
                workList.list = _.filter(workList.list, item => item.workflow_type === APPLY_APPROVE_TYPES.DOCUMENT);
                workList.total = workList.list.length;
                _.forEach(workList.list,(workItem) => {
                    workItem.showApproveBtn = true;
                    //如果是我申请的，除了可以审批之外，我也可以撤回
                    if (_.get(workItem,'applicant.user_id') === userData.getUserData().user_id && hasPrivilege('GET_MY_WORKFLOW_LIST')){
                        workItem.showCancelBtn = true;
                    }
                });
                this.dispatch({error: false, loading: false, data: workList});
                return;
            }
            DocumentWriteAjax.getAllLeaveApplyList(queryObj).then((data) => {
                scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
                //需要对全部列表进行一下处理，知道哪些是可以审批的
                var workListArr = workList.list;
                _.forEach(workListArr,(item) => {
                    var targetObj = _.find(data.list,(dataItem) => {
                        return item.id === dataItem.id;
                    });
                    if (targetObj){
                        targetObj.showApproveBtn = true;
                    }
                });
                //给 自己申请的并且是未通过的审批加上可以撤销的标识
                _.forEach(data.list,(item) => {
                    if (item.status === 'ongoing' && _.get(item,'applicant.user_id') === userData.getUserData().user_id && hasPrivilege('GET_MY_WORKFLOW_LIST')){
                        item.showCancelBtn = true;
                    }
                });
                this.dispatch({error: false, loading: false, data: data});},(errorMsg) => {
                this.dispatch({
                    error: true,
                    loading: false,
                    errMsg: errorMsg || Intl.get('failed.get.all.leave.list','获取全部请假申请失败')
                });});

        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                worklistErrMsg: errorMsg || Intl.get('failed.get.worklist.leave.apply', '获取由我审批的请假申请失败')
            });
        });
    };
}
module.exports = alt.createActions(ReportSendApplyActions);