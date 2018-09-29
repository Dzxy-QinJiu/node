/**
 * 团队统计
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerTeamChart(type = 'total') {
    return {
        title: Intl.get('oplate_customer_analysis.4', '团队统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${type}/team`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'team'),
    };
}
