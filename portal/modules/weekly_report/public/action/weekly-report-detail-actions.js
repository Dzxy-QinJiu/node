var weeklyReportAjax = require("../ajax/weekly-report-ajax");
function weeklyReportDetailActions() {
    this.generateActions(
       'setInitState'//设置初始数据
    );
    // 获取电话的接通情况
    this.getCallInfo = function (pathParam, reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getCallInfo(pathParam, reqData, type).then((resData) => {
                this.dispatch({loading: false, error: false, resData: resData.list});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errMsg: errorMsg});
            }
        );
    };
}
module.exports = alt.createActions(weeklyReportDetailActions);