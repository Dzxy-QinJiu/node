/**
 * 团队统计
 */

import { unknownDataMap } from '../../consts';
import { handleChartClick, isSales } from '../../utils';

export function getCustomerTeamChart(paramObj = {}) {
    return {
        title: paramObj.title || Intl.get('oplate_customer_analysis.4', '团队统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${paramObj.type}/team`,
        chartType: 'bar',
        argCallback: paramObj.argCallback,
        nameValueMap: unknownDataMap,
        chartClickRedirectCallback: handleChartClick.bind(this, 'team'),
        noShowCondition: {
            callback: () => isSales()
        },
    };
}
