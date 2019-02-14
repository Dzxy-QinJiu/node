/**
 * 延期账号团队统计
 */

import { isSales, argCallbackUnderlineTimeToTime, argCallbackMemberIdsToSalesId } from '../../utils';

export function getDelayedAccountTeamChart() {
    return {
        title: Intl.get('user.analysis.team', '团队统计'),
        chartType: 'bar',
        url: '/rest/analysis/user/v3/:data_type/delayed/team',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackMemberIdsToSalesId(arg);
        },
        noShowCondition: {
            callback: () => isSales()
        },
    };
}
