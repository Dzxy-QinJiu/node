/**
 * 行业统计
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerIndustryChart(type = 'total', title) {
    return {
        title: title || Intl.get('oplate_customer_analysis.5', '行业统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${type}/industry`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'industry'),
        customOption: {
            reverse: true
        },
    };
}
