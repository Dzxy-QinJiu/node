/**
 * 新签团队分布
 */

import { isSales } from '../../utils';

export function getSignedCustomerNewTeamChart() {
    return {
        title: '新签团队分布',
        url: '/rest/analysis/customer/label/:data_type/sign/team',
        chartType: 'bar',
        noShowCondition: {
            callback: () => isSales()
        },
    };
}
