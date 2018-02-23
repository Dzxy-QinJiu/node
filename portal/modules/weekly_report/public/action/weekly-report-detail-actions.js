var weeklyReportAjax = require("../ajax/weekly-report-ajax");
function weeklyReportDetailActions() {
    this.generateActions(
       'setInitState',//设置初始数据
    );
    // 获取电话的接通情况
    this.getCallInfo = function (reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getCallInfo(reqData, type).then((resData) => {
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
    // 获取合同情况
    this.getContractInfo = function (reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getContractInfo(reqData, type).then((resData) => {
                this.dispatch({loading: false, error: false, resData: resData});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errMsg: errorMsg});
            }
        );
    };
    // 获取回款情况
    this.getRepaymentInfo = function (reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getRepaymentInfo(reqData, type).then((resData) => {
                this.dispatch({loading: false, error: false, resData: resData});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errMsg: errorMsg});
            }
        );
    };
    // 获取区域覆盖情况
    this.getRegionOverlayInfo = function (reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getRegionOverlayInfo(reqData, type).then((resData) => {
                this.dispatch({loading: false, error: false, resData: resData.result});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errMsg: errorMsg});
            }
        );
    };

}
module.exports = alt.createActions(weeklyReportDetailActions);