/**
 * 团队或个人费用统计 
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getCostChart() {
    return {
        title: '团队或个人费用统计' + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
        url: '/rest/analysis/contract/contract/cost/team/amount',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
        chartType: 'bar',
    };
}
