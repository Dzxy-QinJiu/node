/**
 * 团队或个人回款毛利统计
 */

import { processAmountData, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getRepayChart() {
    return {
        title: '团队或个人回款毛利统计',
        url: '/rest/analysis/contract/contract/repay/team/amount',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
        chartType: 'bar',
        processData: processAmountData,
    };
}
