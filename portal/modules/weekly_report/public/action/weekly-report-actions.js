var weeklyReportAjax = require('../ajax/weekly-report-ajax');
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
function weeklyReportActions() {
    this.generateActions(
        'setInitState',//初始化数据的设置
        'clearData',//清空数据
        'setSelectedWeeklyReportItem',//设置选中项
        'changeSearchInputValue',//修改搜索框的值
        'setSelectedTeamId',//设置选中的团队id
        'setSelectedWeek'//设置选择的第几周
    );
    // 团队信息
    this.getSaleGroupTeams = function(reqData) {
        this.dispatch({loading: true, error: false});
        getMyTeamTreeAndFlattenList(data => {
            if(data.errorMsg) {
                this.dispatch({loading: false,error: true, errMsg: data.errorMsg});
            } else {
                this.dispatch({loading: false,error: false, resData: data.teamList});
            }
        });
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