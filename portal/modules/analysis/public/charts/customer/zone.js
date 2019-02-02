/**
 * 地域统计
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerZoneChart(paramObj = {}) {
    return {
        title: paramObj.title || Intl.get('oplate_customer_analysis.3', '地域统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${paramObj.type}/zone`,
        chartType: 'bar',
        argCallback: paramObj.argCallback,
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'zone'),
    };
}
