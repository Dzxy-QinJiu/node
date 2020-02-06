var callAnalysisAjax = require('MOD_DIR/call_record/public/ajax/call-analysis-ajax');
import {altAsyncUtil} from 'ant-utils';
const {asyncDispatcher} = altAsyncUtil;
let teamAjax = require('MOD_DIR/common/public/ajax/team');
function RecentUserAction() {
    this.generateActions(
    );
    // 成员信息
    this.getSaleMemberList = asyncDispatcher( callAnalysisAjax.getSaleMemberList);
    // 选中团队下的成员
    this.getSelectedTeamSalesMembers = function(teamId) {
        teamAjax.getMemberListByTeamIdAjax().resolvePath({
            group_id: teamId
        }).sendRequest({
            with_teamrole: true
        }).success( list => {
            this.dispatch(list);
        }).error( error => {
            this.dispatch(error.responseText);
        });
    };

}
module.exports = alt.createActions(RecentUserAction);