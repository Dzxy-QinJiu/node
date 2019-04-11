var weeklyReportAjax = require('../ajax/weekly-report-ajax');
function weeklyReportDetailActions() {
    this.generateActions(
        'setInitState',//设置初始数据
    );
    // 获取电话的接通情况
    this.getCallInfo = function(reqData) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getCallInfo(reqData).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData.result});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        }
        );
    };
    // 获取合同情况
    this.getContractInfo = function(reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getContractInfo(reqData, type).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        }
        );
    };
    // 获取回款情况
    this.getRepaymentInfo = function(reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getRepaymentInfo(reqData, type).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        }
        );
    };
    // 获取区域覆盖情况
    this.getRegionOverlayInfo = function(reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getRegionOverlayInfo(reqData, type).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData.result});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        }
        );
    };
    // 获取客户阶段情况
    this.getCustomerStageInfo = function(reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getCustomerStageInfo(reqData, type).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData.result, stageList: resData.stageList});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        }
        );
    };
}
module.exports = alt.createActions(weeklyReportDetailActions);
