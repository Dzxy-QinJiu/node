var weeklyReportAjax = require("../ajax/weekly-report-ajax");
function weeklyReportDetailActions() {
    this.generateActions(
       'setInitState',//设置初始数据
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
    //保存员工的请假信息
    this.addForLeave = function (reqData,callback) {
        this.dispatch({submitting: true, error: false});
        weeklyReportAjax.addAskForLeave(reqData).then((resData) => {
                this.dispatch({submitting: false, error: false});
                _.isFunction(callback) && callback(resData);
            }, (errorMsg) => {
                this.dispatch({submitting: false, error: true, errMsg: errorMsg});
            }
        );
    };
    //更新员工的请假信息
    this.updateForLeave = function (reqData,callback) {
        this.dispatch({updatting: true, error: false});
        weeklyReportAjax.updateAskForLeave(reqData).then((resData) => {
                this.dispatch({updatting: false, error: false});
                _.isFunction(callback) && callback(resData);
            }, (errorMsg) => {
                this.dispatch({updatting: false, error: true, errMsg: errorMsg});
            }
        );
    };
    //删除员工的请假信息
    this.deleteForLeave = function (reqData,callback) {
        this.dispatch({deletting: true, error: false});
        weeklyReportAjax.deleteAskForLeave(reqData).then((resData) => {
                this.dispatch({deletting: false, error: false});
                _.isFunction(callback) && callback();
            }, (errorMsg) => {
                this.dispatch({deletting: false, error: true, errMsg: errorMsg});
            }
        );
    };

}
module.exports = alt.createActions(weeklyReportDetailActions);