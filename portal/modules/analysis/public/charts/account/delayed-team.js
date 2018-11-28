/**
 * 延期账号团队统计
 */

import { unknownDataMap, USER_TYPES, USER_TYPES_WITH_TITLE, isSales } from '../../consts';
import { argCallbackTimeMember } from '../../utils';

export function getDelayedAccountTeamChart() {
    return {
        title: Intl.get('user.analysis.team', '团队统计'),
        chartType: 'bar',
        url: '/rest/analysis/user/v3/:data_type/delayed/team',
        argCallback: argCallbackTimeMember,
        noShowCondition: {
            callback: () => isSales
        },
    };
}
