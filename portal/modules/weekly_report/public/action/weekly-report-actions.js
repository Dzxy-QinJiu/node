var weeklyReportAjax = require("../ajax/weekly-report-ajax");
function weeklyReportActions() {
    this.generateActions(
        'setInitState',//初始化数据的设置
    );
    // 团队信息
    this.getSaleGroupTeams = function (reqData) {
        weeklyReportAjax.getSaleGroupTeams(reqData).then((resData) => {
                this.dispatch({error: false, resData: resData});
            }, (errorMsg) => {
                this.dispatch({error: true, errMsg: errorMsg});
            }
        );
    };

    // 成员信息
    this.getSaleMemberList = function (reqData) {
        weeklyReportAjax.getSaleMemberList(reqData).then((resData) => {
                this.dispatch({error: false, resData: resData});
            }, (errorMsg) => {
                this.dispatch({error: true, errMsg: errorMsg});
            }
        );
    };
    // 获取电话的接通情况
    this.getCallInfo = function (pathParam, reqData, type) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getCallInfo(pathParam, reqData, type).then((resData) => {
                this.dispatch({loading: false, error: false, resData: resData});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errMsg: errorMsg});
            }
        );
    };
}


module.exports = alt.createActions(weeklyReportActions);