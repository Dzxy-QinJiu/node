var weeklyReportAjax = require('../ajax/weekly-report-ajax');
function weeklyReportActions() {
    this.generateActions(
        'setInitState',//初始化数据的设置
        'clearData',//清空数据
        'setSelectedWeeklyReportItem',//设置选中项
        'changeSearchInputValue'//修改搜索框的值
    );
    // 团队信息
    this.getSaleGroupTeams = function(reqData) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getSaleGroupTeams(reqData).then((resData) => {
            this.dispatch({loading: false ,error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false ,error: true, errMsg: errorMsg});
        }
        );
    };

    // 成员信息
    this.getSaleMemberList = function(reqData) {
        this.dispatch({loading: true, error: false});
        weeklyReportAjax.getSaleMemberList(reqData).then((resData) => {
            this.dispatch({loading: false,error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errMsg: errorMsg});
        }
        );
    };

}


module.exports = alt.createActions(weeklyReportActions);