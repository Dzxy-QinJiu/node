var phoneAlertAction = require('../action/phone-alert-action');
var crmStore = require('../../../crm/public/store/crm-store');

function ClueCustomerPhoneAlertStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(phoneAlertAction);
}
ClueCustomerPhoneAlertStore.prototype.resetState = function() {
    //正在跟据电话号码获取客户详情
    this.isGettingCustomer = false;
    //获取客户详情失败后的提示
    this.getCustomerErrMsg = '';
    //通过线索id查询到的线索基本信息，用于展示线索的基本资料
    this.clueInfoArr = [];
    //跟进记录textare中的内容
    this.inputContent = '';
    //正在提交跟进记录
    this.submittingTrace = false;
    //提交跟进记录后的提示
    this.submittingTraceMsg = '';
    //正在编辑跟进记录
    this.isEdittingTrace = true;
    this.showAddFeedback = false;//是否展示反馈
};
//恢复默认状态
ClueCustomerPhoneAlertStore.prototype.setInitialState = function() {
    this.resetState();
};
//查看、收起线索详情的操作
ClueCustomerPhoneAlertStore.prototype.toggleClueDetail = function(id) {
    let curCustomer = _.find(this.clueInfoArr, item => item.id === id);
    curCustomer.isShowDetail = !curCustomer.isShowDetail;
};
//跟据线索的id获取线索的详情
ClueCustomerPhoneAlertStore.prototype.getClueById = function(result) {
    if (result.loading) {
        this.isGettingCustomer = true;
        this.getCustomerErrMsg = '';
    } else if (result.error) {
        this.getCustomerErrMsg = result.errorMsg;
        this.isGettingCustomer = false;
    } else {
        this.isGettingCustomer = false;
        this.getCustomerErrMsg = '';
        if (_.isObject(result.data)) {
            this.clueInfoArr.push(result.data);
        }
    }
};

ClueCustomerPhoneAlertStore.prototype.setContent = function(value) {
    this.inputContent = value;
};
ClueCustomerPhoneAlertStore.prototype.setEditStatus = function(statusObj) {
    this.isEdittingTrace = statusObj.isEdittingTrace;
    this.submittingTraceMsg = statusObj.submittingTraceMsg;
};
ClueCustomerPhoneAlertStore.prototype.updateClueTrace = function(result) {
    if (result.loading) {
        this.submittingTrace = true;
        this.submittingTraceMsg = '';
    } else if (result.error) {
        this.submittingTraceMsg = result.errorMsg || Intl.get('crm.phone.failed.add.trace', '添加跟进记录失败');
        this.submittingTrace = false;
    } else {
        this.submittingTrace = false;
        this.submittingTraceMsg = Intl.get('crm.phone.success.add.trace', '添加跟进记录成功');
        this.isEdittingTrace = false;
    }
};
ClueCustomerPhoneAlertStore.prototype.setSubmitErrMsg = function(errMsg) {
    this.submittingTraceMsg = errMsg;
};

//设置客户信息为空
ClueCustomerPhoneAlertStore.prototype.setInitialClueArr = function() {
    this.clueInfoArr = [];
};
module.exports = alt.createStore(ClueCustomerPhoneAlertStore, 'ClueCustomerPhoneAlertStore');