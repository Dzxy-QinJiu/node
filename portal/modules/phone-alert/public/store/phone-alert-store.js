var phoneAlertAction = require("../action/phone-alert-action");
var crmStore = require("../../../crm/public/store/crm-store");

function PhoneAlertStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(phoneAlertAction);
}
PhoneAlertStore.prototype.resetState = function () {
    //正在跟据电话号码获取客户详情
    this.isGettingCustomer = false;
    //获取客户详情失败后的提示
    this.getCustomerErrMsg = "";
    //通过客户id查询到的客户基本信息，用于展示客户的基本资料
    this.customerInfoArr = [];
    //跟进记录textare中的内容
    this.inputContent = "";
    //正在提交跟进记录
    this.submittingTrace = false;
    //提交跟进记录后的提示
    this.submittingTraceMsg = "";
    //正在编辑跟进记录
    this.isEdittingTrace = true;
    this.showAddFeedback = false;//是否展示反馈
};
//恢复默认状态
PhoneAlertStore.prototype.setInitialState = function () {
  this.resetState();
};

//跟据客户的id获取客户的详情
PhoneAlertStore.prototype.getCustomerById = function (result) {
    if (result.loading){
        this.isGettingCustomer = true;
        this.getCustomerErrMsg = "";
    }else if (result.error){
        this.getCustomerErrMsg = result.errorMsg;
        this.isGettingCustomer = false;
    }else {
        this.isGettingCustomer = false;
        this.getCustomerErrMsg = "";
        if (_.isObject(result.data) && _.isArray(result.data.result) && result.data.result.length){
            this.customerInfoArr.push(result.data.result[0]);
            this.customerInfoArr = crmStore.processForList(this.customerInfoArr);
        }
    }
};
//添加客户成功后把新添加的客户资料放在state上，不用再去发请求获取了
PhoneAlertStore.prototype.setAddCustomerInfo = function (addCustomerInfo) {
    this.customerInfoArr = addCustomerInfo;
};
PhoneAlertStore.prototype.setContent = function (value) {
    this.inputContent = value;
};
PhoneAlertStore.prototype.setEditStatus = function (statusObj) {
    this.isEdittingTrace = statusObj.isEdittingTrace;
    this.submittingTraceMsg = statusObj.submittingTraceMsg;
};
PhoneAlertStore.prototype.updateCustomerTrace = function (result) {
    if (result.loading){
        this.submittingTrace = true;
        this.submittingTraceMsg = "";
    }else if (result.error){
        this.submittingTraceMsg = result.errorMsg || Intl.get("crm.phone.failed.add.trace","添加跟进记录失败");
        this.submittingTrace = false;
    }else {
        this.submittingTrace = false;
        this.submittingTraceMsg = Intl.get("crm.phone.success.add.trace","添加跟进记录成功");
        this.isEdittingTrace = false;
    }
};
PhoneAlertStore.prototype.setSubmitErrMsg = function (errMsg) {
    this.submittingTraceMsg = errMsg;
};
//设置客户的基本信息
PhoneAlertStore.prototype.setCustomerInfoArr = function (obj) {
    this.customerInfoArr = [obj];
};
//设置客户信息为空
PhoneAlertStore.prototype.setInitialCustomerArr = function () {
    this.customerInfoArr = [];
};
module.exports = alt.createStore(PhoneAlertStore , 'PhoneAlertStore');