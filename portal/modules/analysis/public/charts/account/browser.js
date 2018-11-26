/**
 * 浏览器统计
 */

import { ifNotSingleApp } from '../../utils';

export function getAccountBrowserChart(type = 'total') {
    return {
        title: Intl.get('oplate.user.analysis.browser', '浏览器统计'),
        url: '/rest/analysis/user/v3/:auth_type/browser',
        chartType: 'bar',
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
