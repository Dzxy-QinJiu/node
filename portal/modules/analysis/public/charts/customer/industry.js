/**
 * 行业统计
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerIndustryChart(paramObj = {}) {
    return {
        title: paramObj.title || Intl.get('oplate_customer_analysis.5', '行业统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${paramObj.type}/industry`,
        chartType: 'bar',
        argCallback: paramObj.argCallback,
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'industry'),
        customOption: {
            reverse: true
        },
    };
}
