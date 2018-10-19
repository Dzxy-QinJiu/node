/**
 * 团队统计
 */

import { unknownDataMap, isSales } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerTeamChart(type = 'total', title) {
    return {
        title: title || Intl.get('oplate_customer_analysis.4', '团队统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${type}/team`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'team'),
        noShowCondition: {
            callback: () => isSales
        },
    };
}
