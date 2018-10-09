/**
 * 地域统计
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerZoneChart(type = 'total', title) {
    return {
        title: title || Intl.get('oplate_customer_analysis.3', '地域统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${type}/zone`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'zone'),
    };
}
