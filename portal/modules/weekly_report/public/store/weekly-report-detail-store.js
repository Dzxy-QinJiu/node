var weeklyReportDetailActions = require("../action/weekly-report-detail-actions");
function weeklyReportDetailStore() {
    this.setInitState();
    this.bindActions(weeklyReportDetailActions);
}
// 通话类型的常量
const CALL_TYPE_OPTION = {
    ALL: 'all',
};
weeklyReportDetailStore.prototype.setInitState = function () {
    //开始时间
    this.start_time = moment().startOf('week').valueOf();
    //结束时间
    this.end_time = moment().endOf('week').valueOf();
    this.call_type = CALL_TYPE_OPTION.ALL; // 通话类型
    //电话统计
    this.salesPhone = {
        list: [],
        loading: false,
        errMsg: ""//获取数据失败
    };

};

//获取电话统计
weeklyReportDetailStore.prototype.getCallInfo = function (result) {
    this.salesPhone.loading = result.loading;
    if (result.error){
        this.salesPhone.errMsg = result.errMsg;
    }else{
        this.salesPhone.list = _.isArray(result.resData) ? result.resData : [];
    }
};
module.exports = alt.createStore(weeklyReportDetailStore, 'weeklyReportDetailStore');