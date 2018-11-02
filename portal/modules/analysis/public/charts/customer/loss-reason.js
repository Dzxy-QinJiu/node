/**
 * 流失原因分析
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerLossReasonChart(type = 'total', title) {
    return {
        title: title || '流失原因分析',
        url: `/rest/analysis/customer/v1/:auth_type/${type}/team`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'team'),
    };
}
