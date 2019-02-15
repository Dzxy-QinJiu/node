/**
 * 行业分布
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getContractIndustryChart() {
    return {
        title: '行业分布',
        chartType: 'bar',
        customOption: {
            reverse: true,
        },
        url: '/rest/analysis/contract/contract/:data_type/industry',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
    };
}
