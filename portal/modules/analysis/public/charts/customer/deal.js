/**
 * 成交分析
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerDealChart(type = 'total', title) {
    return {
        title: title || '成交分析',
        url: `/rest/analysis/customer/v1/:auth_type/${type}/team`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'team'),
    };
}
