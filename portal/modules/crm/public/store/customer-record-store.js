/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var CustomerRecordActions = require('../action/customer-record-action');

function CustomerRecordStore() {
    //初始化state数据
    this.resetState();
    this.bindActions(CustomerRecordActions);
}
CustomerRecordStore.prototype.resetState = function() {
    this.customerRecord = [];//客户跟踪记录列表
    this.customerRecordLoading = false;//正在加载客户跟踪记录信息
    this.customerRecordErrMsg = '';//加载错误后的信息
    this.addCustomerLoading = false;//正在保存增加的用户跟踪记录
    this.addCustomerErrMsg = '';//保存增加的用户跟踪记录错误
    this.addCustomerSuccMsg = '';//保存增加的用户跟踪记录成功
    this.selectedtracetype = 'other';//下拉框选中的类型
    this.initialType = 'other';//下拉框默认选中的类型
    this.total = 0;//共获取的数据总数
    this.inputContent = {value: ''};//输入框中的内容
    this.initialContent = '';
    this.addContentDetailShow = 'false';//增加详情的输入框是否显示
    this.detailContent = {value: ''};//增加详情的输入框中的内容
    this.initialDetailContent = '';//增加详情的输入框中的初始化中的内容
    this.addDetailLoading = false;//正在增加详情
    this.addDetailErrMsg = '';//增加详情保存错误
    this.addDetailSuccMsg = '';//正在增加详情保存成功
    this.updateId = '';//正在更新的某一条的id
    this.listenScrollBottom = true;//是否下拉加载
    this.pageSize = 10;//每页的加载条数
    this.curPage = 1;//当前页
    this.isEdit = false;//当前有一条数据处在编辑状态
    this.modalDialogFlag = false;//是否显示模态框
    this.saveButtonType = '';//点击增加跟进记录的保存还是补充跟进记录的保存
    this.edittingItem = [];//当前正在编辑添加详情的那条跟进记录
    this.lastPhoneTraceItemId = '';//最后一条电话类型的跟进记录
};
//恢复默认状态
CustomerRecordStore.prototype.dismiss = function() {
    this.resetState();
};
CustomerRecordStore.prototype.getCustomerTraceList = function(result) {
    this.addCustomerErrMsg = '';
    this.addCustomerSuccMsg = '';
    if (!result.loading){
        this.customerRecordLoading = false;
        if (result.error){
            this.customerRecordErrMsg = result.errorMsg;
            this.customerRecord = [];
        } else {
            this.customerRecordErrMsg = '';
            this.curPage++;
            var customerRecord = _.isArray(result.data.result) ? result.data.result : [];
            customerRecord.forEach(function(item){
                item.showAdd = false;
            });
            this.customerRecord = this.customerRecord.concat(customerRecord);
            //过滤出所有电话类型的通话记录
            var phoneTypeRecords = _.filter(this.customerRecord,(item) => {
                return item.type === 'phone';
            });
            //找出最后一条电话跟进记录的id
            if (phoneTypeRecords.length){
                this.lastPhoneTraceItemId = _.first(phoneTypeRecords).id;
            }
            this.total = result.data.total;
        }
    }
};
CustomerRecordStore.prototype.addCustomerTrace = function(result) {
    if (result.loading) {
        this.addCustomerLoading = true;
        this.addCustomerErrMsg = '';
        this.addCustomerSuccMsg = '';
    } else if (result.error) {
        this.addCustomerLoading = false;
        this.addCustomerErrMsg = result.errorMsg;
        this.addCustomerSuccMsg = '';
    } else {
        this.addCustomerLoading = false;
        this.addCustomerErrMsg = '';
        this.addCustomerSuccMsg = result.data.msg;
        result.data.customer_trace.showAdd = false;
        this.customerRecord.unshift(result.data.customer_trace);
        this.total += 1;
        this.inputContent = {value: ''};
        this.selectedtracetype = 'other';
    }
};
CustomerRecordStore.prototype.updateCustomerTrace = function(result) {
    if (result.loading) {
        this.addDetailLoading = true;
        this.addDetailErrMsg = '';
        this.addDetailSuccMsg = '';
    } else if (result.error) {
        var _this = this;
        this.addDetailLoading = false;
        this.addDetailErrMsg = result.errorMsg;
        this.addDetailSuccMsg = '';
        var customerRecord = this.customerRecord;
        customerRecord.forEach(function(item) {
            if (item.id === _this.updateId) {
                item.showAdd = true;
            }
        });
    } else {
        var _this = this;
        this.addDetailLoading = false;
        this.addDetailErrMsg = '';
        this.addDetailSuccMsg = result.data.msg;
        this.isEdit = false;
        var customerRecord = this.customerRecord;
        customerRecord.forEach( item => {
            if (item.id === this.updateId) {
                item.remark = this.detailContent.value;
                item.showAdd = false;
            }
        });
        this.customerRecord = customerRecord;
    }
};
CustomerRecordStore.prototype.setType = function(type) {
    this.addCustomerErrMsg = '';
    this.addCustomerSuccMsg = '';
    this.selectedtracetype = type;
};
CustomerRecordStore.prototype.setContent = function(content) {
    this.addCustomerErrMsg = '';
    this.addCustomerSuccMsg = '';
    this.inputContent = content;
};
CustomerRecordStore.prototype.setDetailContent = function(content) {
    this.addCustomerErrMsg = '';
    this.addCustomerSuccMsg = '';
    this.detailContent = content;
    this.isEdit = true;
};
CustomerRecordStore.prototype.setUpdateId = function(id) {
    this.updateId = id;
};
CustomerRecordStore.prototype.setInitial = function() {
    this.inputContent = {value: ''},
    this.detailContent = {value: ''};
    this.customerRecord = [];
    this.listenScrollBottom = true;
    this.curPage = 1;
};
CustomerRecordStore.prototype.changeAddButtonType = function(type) {
    this.saveButtonType = type;
};
CustomerRecordStore.prototype.setModalDialogFlag = function(state) {
    this.modalDialogFlag = state;
};
CustomerRecordStore.prototype.updateItem = function(item) {
    this.edittingItem = item;
};
CustomerRecordStore.prototype.setLoading = function() {
    this.customerRecordLoading = true;
};

module.exports = alt.createStore(CustomerRecordStore, 'CustomerRecordStore');