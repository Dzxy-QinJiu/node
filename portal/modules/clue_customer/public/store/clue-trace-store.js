/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/6/10.
 */
var ClueTraceActions = require('../action/clue-trace-action');

function ClueTraceStore() {
    //初始化state数据
    this.resetState();
    //跟进记录统计时间
    this.start_time = 0;
    this.end_time = 0;
    this.bindActions(ClueTraceActions);
}
ClueTraceStore.prototype.resetState = function() {
    this.customerRecord = [];//线索跟踪记录列表
    this.customerRecordLoading = false;//正在加载线索跟踪记录信息
    this.customerRecordErrMsg = '';//加载错误后的信息
    this.addCustomerLoading = false;//正在保存增加的线索跟踪记录
    this.addCustomerErrMsg = '';//保存增加的线索跟踪记录错误
    this.total = 0;//共获取的数据总数
    this.inputContent = {value: ''};//输入框中的内容
    this.initialContent = '';
    this.addContentDetailShow = 'false';//增加详情的输入框是否显示
    this.detailContent = {value: ''};//增加详情的输入框中的内容
    this.initialDetailContent = '';//增加详情的输入框中的初始化中的内容
    this.addDetailLoading = false;//正在增加详情
    this.addDetailErrMsg = '';//增加详情保存错误
    this.updateId = '';//正在更新的某一条的id
    this.listenScrollBottom = true;//是否下拉加载
    this.pageSize = 10;//每页的加载条数
    this.curPage = 1;//当前页
    this.isEdit = false;//当前有一条数据处在编辑状态
    this.modalDialogFlag = false;//是否显示模态框
    this.saveButtonType = '';//点击增加跟进记录的保存还是补充跟进记录的保存
    this.edittingItem = [];//当前正在编辑添加详情的那条跟进记录
    this.lastPhoneTraceItemId = '';//最后一条电话类型的跟进记录
    this.filterType = 'all';
};
//恢复默认状态
ClueTraceStore.prototype.dismiss = function() {
    this.resetState();
};
//修改筛选的时间
ClueTraceStore.prototype.changeTimeRange = function(timeRange) {
    this.start_time = timeRange.start_time;
    this.end_time = timeRange.end_time;
};
//获取线索跟进记录列表
ClueTraceStore.prototype.getClueTraceList = function(result) {
    if (result.loading){
        this.customerRecordLoading = true;
        this.customerRecordErrMsg = '';
        this.addCustomerErrMsg = '';
    }else if(result.error){
        this.customerRecordLoading = false;
        this.customerRecordErrMsg = result.errorMsg;
    }else{
        this.customerRecordLoading = false;
        this.customerRecordErrMsg = '';
        this.curPage++;
        var customerRecord = _.isArray(result.data.result) ? result.data.result : [];
        customerRecord.forEach(function(item) {
            item.showAdd = false;
        });
        this.customerRecord = this.customerRecord.concat(customerRecord);
        // //电话类型（eefung电话类型，客套容联电话类型,客套APP电话类型，回访类型）
        // const PHONE_TYPES = [CALL_RECORD_TYPE.PHONE, CALL_RECORD_TYPE.CURTAO_PHONE, CALL_RECORD_TYPE.APP, CALL_RECORD_TYPE.CALL_BACK];
        // //过滤出所有电话类型的通话记录(eefung、容联、客套APP、回访)
        // let phoneTypeRecords = _.filter(this.customerRecord, (item) => {
        //     return _.includes(PHONE_TYPES, item.type);
        // });
        // //找出最后一条电话跟进记录的id
        // if (phoneTypeRecords.length) {
        //     this.lastPhoneTraceItemId = _.first(phoneTypeRecords).id;
        // }
        this.total = result.data.total;
    }
};
ClueTraceStore.prototype.addClueTrace = function(result) {
    if (result.loading) {
        this.addCustomerLoading = true;
        this.addCustomerErrMsg = '';
    } else if (result.error) {
        this.addCustomerLoading = false;
        this.addCustomerErrMsg = result.errorMsg;
    } else {
        this.addCustomerLoading = false;
        this.addCustomerErrMsg = '';
        result.data.customer_trace.showAdd = false;
        //全部类型下或添加类型筛选下，将新添加的跟进加入到当前展示类型的跟进列表中
        if (this.filterType === 'all') {
            this.customerRecord.unshift(result.data.customer_trace);
        }
        this.total += 1;
        this.inputContent = {value: ''};
    }
};
ClueTraceStore.prototype.updateClueTrace = function(result) {
    if (result.loading) {
        this.addDetailErrMsg = '';
    } else if (result.error) {
        this.addDetailErrMsg = result.errorMsg;
        var customerRecord = this.customerRecord;
        customerRecord.forEach((item) => {
            if (item.id === this.updateId) {
                item.showAdd = true;
            }
        });
    } else {
        this.addDetailErrMsg = '';
        this.isEdit = false;
        var customerRecord = this.customerRecord;
        customerRecord.forEach(item => {
            if (item.id === this.updateId) {
                item.remark = this.detailContent.value;
                item.showAdd = false;
            }
        });
        this.customerRecord = customerRecord;
    }
};
ClueTraceStore.prototype.setFilterType = function(type) {
    this.filterType = type;
};
ClueTraceStore.prototype.setContent = function(content) {
    this.addCustomerErrMsg = '';
    this.inputContent = content;
};
ClueTraceStore.prototype.setDetailContent = function(content) {
    this.addCustomerErrMsg = '';
    //取消编辑时
    if (_.get(content, 'cancelEdit')) {
        this.isEdit = false;
        delete content.cancelEdit;
    } else {
        this.isEdit = true;
    }
    this.detailContent = content;

};
ClueTraceStore.prototype.setUpdateId = function(id) {
    this.updateId = id;
};
ClueTraceStore.prototype.setInitial = function() {
    this.inputContent = {value: ''},
    this.detailContent = {value: ''};
    this.customerRecord = [];
    this.listenScrollBottom = true;
    this.curPage = 1;
};
ClueTraceStore.prototype.changeAddButtonType = function(type) {
    this.saveButtonType = type;
};
ClueTraceStore.prototype.setModalDialogFlag = function(state) {
    this.modalDialogFlag = state;
};
ClueTraceStore.prototype.updateItem = function(item) {
    this.edittingItem = item;
};
ClueTraceStore.prototype.setLoading = function() {
    this.customerRecordLoading = true;
};

module.exports = alt.createStore(ClueTraceStore, 'ClueTraceStore');