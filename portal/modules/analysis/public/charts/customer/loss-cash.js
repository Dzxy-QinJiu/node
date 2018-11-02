/**
 * 流失现金趋势
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerLossCashChart(type = 'total', title) {
    return {
        title: title || '流失现金趋势',
        url: `/rest/analysis/customer/v1/:auth_type/${type}/team`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'team'),
    };
}
