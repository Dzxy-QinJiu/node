/**
 * 团队或个人统计
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId, processDataNumToValue } from '../../utils';

export function getContractNewChart() {
    return {
        title: '团队或个人统计',
        chartType: 'bar',
        url: '/rest/analysis/contract/contract/:data_type/gross/profit/team',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
        processData: processDataNumToValue
    };
}
