/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var BusinessApplyAction = require('../action/business-apply-action');
function BusinessApplyStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(BusinessApplyAction);
    this.exportPublicMethods({
        updateAllApplyItemStatus: this.updateAllApplyItemStatus});
}
BusinessApplyStore.prototype.setInitState = function() {
    this.sort_field = 'create_time';//排序字段
    this.status = '';//请假申请的状态
    this.order = 'descend';
    this.page_size = 20;
    this.lastBusinessApplyId = '';//用于下拉加载的id
    //所有申请列表
    this.applyListObj = {
        // "" loading error
        loadingResult: 'loading',
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    this.lastApplyId = '';
    //由我审批的出差申请列表
    this.workListApplyObj = {
        // "" loading error
        loadingResult: 'loading',
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    //由我发起的出差申请
    this.selfApplyList = {
        // "" loading error
        loadingResult: 'loading',
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ''
    };
    //筛选类别 all(全部) pass(已通过) reject(已驳回)  false(待审批)
    this.applyListType = 'all';
};
// BusinessApplyStore.prototype.getAllApplyList = function(data) {
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
BusinessApplyStore.prototype.clearData = function() {
    this.applyListObj.list = [];
    this.selectedDetailItem = {};
    this.selectedDetailItemIdx = -1;
    this.listenScrollBottom = false;
};
BusinessApplyStore.prototype.getAllApplyList = function(obj) {
    if (obj.loading) {
        this.applyListObj.loadingResult = 'loading';
        this.applyListObj.errorMsg = '';
        this.workListApplyObj.errorMsg = '';
    } else if (obj.error) {
        this.applyListObj.loadingResult = 'error';
        //优先展示我的审批列表获取错误的信息
        this.applyListObj.errorMsg = obj.worklistErrMsg || obj.errorMsg;
        if (obj.worklistErrMsg){
            this.workListApplyObj.loadingResult = 'error';
            this.workListApplyObj.errorMsg = obj.worklistErrMsg;
            this.workListApplyObj.list = [];
        }
        //获取由我审批的
        if (!this.lastApplyId) {
            this.clearData();
        }
    } else if (_.isArray(_.get(obj,'workList.list'))) {
        this.workListApplyObj.list = _.get(obj,'workList.list');
        this.workListApplyObj.loadingResult = '';
        this.workListApplyObj.errorMsg = '';
    } else {
        //由我审批的申请列表
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
BusinessApplyStore.prototype.setSelectedDetailItem = function({obj, idx}) {
    this.selectedDetailItem = obj;
    this.selectedDetailItemIdx = idx;
};
BusinessApplyStore.prototype.changeApplyListType = function(type) {
    this.applyListType = type;
    this.lastApplyId = '';
    // this.showUpdateTip = false;
    // this.isCheckUnreadApplyList = false;
};
BusinessApplyStore.prototype.changeApplyAgreeStatus = function(message) {
    this.selectedDetailItem.status = message.agree;
    this.selectedDetailItem.detail = message.detail;
    this.selectedDetailItem.update_time = message.update_time;
};
BusinessApplyStore.prototype.updateAllApplyItemStatus = function(updateItem) {
    var allApplyArr = this.getState().applyListObj.list;
    this.getState().selectedDetailItem.status = updateItem.status;
    _.forEach(allApplyArr,(item) => {
        if (item.id === updateItem.id){
            item.status = updateItem.status;
        }
    });

};

module.exports = alt.createStore(BusinessApplyStore, 'BusinessApplyStore');