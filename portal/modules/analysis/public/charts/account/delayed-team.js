/**
 * 延期账号团队统计
 */

import { argCallbackTimeMember, isSales } from '../../utils';

export function getDelayedAccountTeamChart() {
    return {
        title: Intl.get('user.analysis.team', '团队统计'),
        chartType: 'bar',
        url: '/rest/analysis/user/v3/:data_type/delayed/team',
        argCallback: argCallbackTimeMember,
        noShowCondition: {
            callback: () => isSales()
        },
    };
}
