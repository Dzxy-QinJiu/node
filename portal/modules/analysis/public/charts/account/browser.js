/**
 * 浏览器统计
 */

import { ifNotSingleApp, argCallbackTeamId, argCallbackMemberIdToSalesId } from '../../utils';

export function getAccountBrowserChart(type = 'total') {
    return {
        title: Intl.get('oplate.user.analysis.browser', '浏览器统计'),
        url: '/rest/analysis/user/v3/:auth_type/browser',
        argCallback: arg => {
            argCallbackTeamId(arg);
            argCallbackMemberIdToSalesId(arg);
        },
        chartType: 'bar',
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
