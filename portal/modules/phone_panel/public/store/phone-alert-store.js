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
    //通过电话号码查询到的客户基本信息，用于展示客户的基本资料
    this.customerInfoArr = [];
    //跟进记录textare中的内容
    this.inputContent = "";
    //正在提交跟进记录
    this.submittingTrace = false;
    //提交跟进记录后的提示
    this.submittingTraceMsg = "";
    //正在编辑跟进记录
    this.isEdittingTrace = true;
    this.addCustomer = false;//是否需要添加客户 true代码需要添加客户，false代表不需要添加客户
    this.customerUnknown = true;//客户存在状态  true代表客户存在状态未知，false 代表知道客户存在状态已知
    this.showAddFeedback = false;//是否展示反馈
};
//恢复默认状态
PhoneAlertStore.prototype.setInitialState = function () {
  this.resetState();
};
PhoneAlertStore.prototype.getCustomerByPhone = function (result) {
    if (result.loading){
        this.isGettingCustomer = true;
        this.getCustomerErrMsg = "";
        this.customerInfoArr = [];
    }else if (result.error){
        this.getCustomerErrMsg = result.errorMsg;
        this.isGettingCustomer = false;
        this.customerInfoArr = [];
    }else {
        //客户存在状态已知
        this.customerUnknown = false;
        this.isGettingCustomer = false;
        this.getCustomerErrMsg = "";
        this.customerInfoArr = crmStore.processForList(result.data.result);
        if (result.data.result.length === 0){
            //此客户不存在，需要添加客户
            this.addCustomer = true;
        }
    }
};

//跟据客户的id获取客户的详情
PhoneAlertStore.prototype.getCustomerById = function (result) {

    if (result.loading){
        this.isGettingCustomer = true;
        this.getCustomerErrMsg = "";
        this.customerInfoArr = [];
    }else if (result.error){
        this.getCustomerErrMsg = result.errorMsg;
        this.isGettingCustomer = false;
        this.customerInfoArr = [];
    }else {
        this.isGettingCustomer = false;
        this.getCustomerErrMsg = "";
        this.customerInfoArr = crmStore.processForList([result.data]);
        //客户存在状态已知
        this.customerUnknown = false;
        this.addCustomer = false;
    }
};
//添加客户成功后把新添加的客户资料放在state上，不用再去发请求获取了
PhoneAlertStore.prototype.setAddCustomerInfo = function (addCustomerInfo) {
    this.customerInfoArr = addCustomerInfo;
};
PhoneAlertStore.prototype.setContent = function (value) {
    this.inputContent = value;
};
//添加客户成功后，addCustomer状态改为false
PhoneAlertStore.prototype.setAddCustomer = function (status) {
    this.addCustomer = status;
};
PhoneAlertStore.prototype.setCustomerUnknown = function (status) {
    this.customerUnknown = status;
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
    this.customerUnknown = false;
};
module.exports = alt.createStore(PhoneAlertStore , 'PhoneAlertStore');