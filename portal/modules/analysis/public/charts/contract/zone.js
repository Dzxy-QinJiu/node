/**
 * 地域分布
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getContractZoneChart() {
    return {
        title: '地域分布',
        chartType: 'bar',
        option: {
            grid: {
                left: 80,
            },
        },
        url: '/rest/analysis/contract/contract/:data_type/region',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
    };
}
