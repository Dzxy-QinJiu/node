/**
 * 近3个月费用周趋势图
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getCostTrendChart() {
    return {
        title: Intl.get('contract.150', '近3个月费用周趋势图') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
        url: '/rest/analysis/contract/contract/cost/trend',
        argCallback: arg => {
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
            argCallbackUnderlineTimeToTime(arg);

            const query = arg.query;

            if (query) {
                query.starttime = moment().subtract(3, 'month').valueOf();
                query.endtime = moment().valueOf();
            }
        },
        chartType: 'line',
    };
}
