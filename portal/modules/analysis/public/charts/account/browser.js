/**
 * 浏览器统计
 */

import { ifNotSingleApp, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToSalesId } from '../../utils';

export function getAccountBrowserChart(type = 'all') {
    return {
        title: Intl.get('oplate.user.analysis.browser', '浏览器统计'),
        url: '/rest/analysis/user/v3/:auth_type/browser',
        conditions: [{
            name: 'analysis_type',
            value: type
        }],
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToSalesId(arg);
        },
        chartType: 'bar',
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
