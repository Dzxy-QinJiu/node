/**
 * 签约客户团队分布
 */

import { isSales } from '../../utils';

export function getSignedCustomerTotalTeamChart(paramObj = {}) {
    return {
        title: '签约客户团队分布',
        url: '/rest/analysis/customer/label/:data_type/sign/total/team',
        argCallback: paramObj.argCallback,
        chartType: 'bar',
        noShowCondition: {
            callback: () => isSales()
        },
    };
}
