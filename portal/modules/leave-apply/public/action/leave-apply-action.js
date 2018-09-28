/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var LeaveApplyAjax = require('../ajax/leave-apply-ajax');
function LeaveApplyActions() {
    this.generateActions(
        'setInitState',
        'setSelectedDetailItem',//点击某个申请
        'changeApplyListType',
        'changeApplyAgreeStatus',//审批完后改变出差申请的状态
        'afterAddApplySuccess'
    );
    // this.getAllApplyList = function(queryObj) {
    //     //todo 需要先获取待审批列表，成功后获取全部列表
    //     this.dispatch({loading: true, error: false});
    //     LeaveApplyAjax.getWorklistLeaveApplyList().then((workList) => {
    //         this.dispatch({workList: workList});
    //         LeaveApplyAjax.getAllApplyList(queryObj).then((data) => {
    //             //需要对全部列表进行一下处理，知道哪些是可以审批的
    //             var workListArr = workList.list;
    //             _.forEach(workListArr,(item) => {
    //                 var targetObj = _.find(data.list,(dataItem) => {
    //                     return item.id === dataItem.id;
    //                 });
    //                 if (targetObj){
    //                     targetObj.showApproveBtn = true;
    //                 }
    //             });
    //             this.dispatch({error: false, loading: false, data: data});},(errorMsg) => {
    //             this.dispatch({
    //                 error: true,
    //                 loading: false,
    //                 errMsg: errorMsg || Intl.get('failed.get.all.leave.apply', '获取全部出差申请失败')
    //             });});
    //
    //     }, (errorMsg) => {
    //         this.dispatch({
    //             error: true,
    //             loading: false,
    //             worklistErrMsg: errorMsg || Intl.get('failed.get.worklist.leave.apply', '获取由我审批的出差申请失败')
    //         });
    //     });
    //
    //     // LeaveApplyAjax.getAllApplyList(queryObj).then((data) => {
    //     //     this.dispatch({error: false, loading: false, data: data});
    //     // }, (errorMsg) => {
    //     //     this.dispatch({
    //     //         error: true,
    //     //         loading: false,
    //     //         errMsg: errorMsg || Intl.get('failed.get.all.leave.apply', '获取全部出差申请失败')
    //     //     });
    //     // });
    // };
    // this.getSelfApplyList = function() {
    //     this.dispatch({error: false, loading: true});
    //     LeaveApplyAjax.getSelfApplyList().then((data) => {
    //         this.dispatch({error: false, loading: false, data: data});
    //     }, (errorMsg) => {
    //         this.dispatch({
    //             error: true,
    //             loading: false,
    //             errMsg: errorMsg || Intl.get('failed.get.self.leave.apply', '获取我的出差申请失败')
    //         });
    //     });
    // };
    // this.getWorklistLeaveApplyList = function() {
    //     this.dispatch({error: false, loading: true});
    //     LeaveApplyAjax.getWorklistLeaveApplyList().then((data) => {
    //         this.dispatch({error: false, loading: false, data: data});
    //     }, (errorMsg) => {
    //         this.dispatch({
    //             error: true,
    //             loading: false,
    //             errMsg: errorMsg || Intl.get('failed.get.worklist.leave.apply', '获取由我审批的出差申请失败')
    //         });
    //     });
    // };
}
module.exports = alt.createActions(LeaveApplyActions);