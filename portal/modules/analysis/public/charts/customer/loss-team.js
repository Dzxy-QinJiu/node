/**
 * 流失客户团队分析
 */

import { isSales } from '../../utils';

export function getLossCustomerTeamChart(paramObj = {}) {
    return {
        title: '流失客户团队分析',
        chartType: 'bar',
        url: '/rest/analysis/customer/label/:data_type/churn/team',
        argCallback: paramObj.argCallback,
        noShowCondition: {
            callback: () => isSales()
        },
    };
}
