/**
 * 团队分布
 */

import { isSales, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, processDataNumToValue } from '../../utils';

export function getContractTeamChart() {
    return {
        title: '团队分布',
        chartType: 'bar',
        noShowCondition: {
            callback: () => isSales()
        },
        url: '/rest/analysis/contract/contract/:data_type/gross/profit/team',
        conditions: [{
            name: 'contract_type',
            value: 'total'
        }],
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
        },
        processData: processDataNumToValue
    };
}
