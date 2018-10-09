/**
 * 续约客户时间统计
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick } from '../../utils';

export function getCustomerTimeChart(type = 'total', title) {
    return {
        title: title || '续约客户时间统计',
        url: `/rest/analysis/customer/v1/:auth_type/${type}/team`,
        chartType: 'bar',
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'team'),
    };
}
