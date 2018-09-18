/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var LeaveApplyAction = require('../action/leave-apply-action');
function LeaveApplyStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(LeaveApplyAction);
}
LeaveApplyStore.prototype.setInitState = function() {
    //获取全部申请信息时
    this.isLoadingAllApply = true;
    this.allApplyErrMsg = '';
    this.allApplyList = [];
    //获取由自己发起的出差申请
    this.isLoadingSelfApply = true;
    this.selfApplyErrMsg = '';
    this.selfApplyList = [];
    //获取由我审批的出差申请
    this.isLoadingWrokList = true;
    this.workListErrMsg = '';
    this.workLisApplyList = [];
    this.sort_field = 'create_time';//排序字段
    this.status = '';//请假申请的状态
    this.order = '';
    this.page_size = 20;
    this.lastLeaveApplyId = '';//用于下拉加载的id
    //申请列表
    this.applyListObj = {
        // "" loading error
        loadingResult: 'loading',
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    this.lastApplyId = '';
};
// LeaveApplyStore.prototype.getAllApplyList = function(data) {
//     if (data.loading){
//         this.isLoadingAllApply = true;
//         this.allApplyErrMsg = '';
//         this.allApplyList = [];
//     }else if (data.error){
//         this.isLoadingAllApply = false;
//         this.allApplyErrMsg = data.errMsg;
//         this.allApplyList = [];
//     }else{
//         this.isLoadingAllApply = false;
//         this.allApplyErrMsg = '';
//         this.allApplyList = data.list;
//     }
//
// };
//清空数据
LeaveApplyStore.prototype.clearData = function() {
    this.applyListObj.list = [];
    this.selectedDetailItem = {};
    this.selectedDetailItemIdx = -1;
    this.listenScrollBottom = false;
};
LeaveApplyStore.prototype.getAllApplyList = function(obj) {
    if (obj.loading) {
        this.applyListObj.loadingResult = 'loading';
        this.applyListObj.errorMsg = '';
    } else if (obj.error) {
        this.applyListObj.loadingResult = 'error';
        this.applyListObj.errorMsg = obj.errorMsg;
        if (!this.lastApplyId) {
            this.clearData();
        }
    } else {
        this.applyListObj.loadingResult = '';
        this.applyListObj.errorMsg = '';
        this.totalSize = obj.data.total;
        let applyList = obj.data.list;
        if (_.isArray(applyList) && applyList.length) {
            if (this.lastApplyId) {//下拉加载数据时
                this.applyListObj.list = this.applyListObj.list.concat(applyList);
            } else {//首次获取数据时
                this.applyListObj.list = applyList;
                this.selectedDetailItem = applyList[0];
                this.selectedDetailItemIdx = 0;
            }
            this.lastApplyId = this.applyListObj.list.length ? _.last(this.applyListObj.list).id : '';
            this.listenScrollBottom = this.applyListObj.list.length < this.totalSize;
        } else if (!this.lastApplyId) {//获取第一页就没有数据时
            this.clearData();
        } else {//下拉加载取得数据为空时需要取消下拉加载得处理（以防后端得total数据与真实获取得数据列表不一致时，一直触发下拉加载取数据得死循环问题）
            this.listenScrollBottom = false;
        }
    }
};

module.exports = alt.createStore(LeaveApplyStore, 'LeaveApplyStore');