/**
 * 团队或个人费用统计 
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getCostChart() {
    return {
        title: '团队或个人费用统计',
        url: '/rest/analysis/contract/contract/cost/team/amount',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
        chartType: 'bar',
    };
}
