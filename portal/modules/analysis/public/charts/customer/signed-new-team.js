/**
 * 新签团队分布
 */

import { isSales } from '../../utils';

export function getSignedCustomerNewTeamChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.distribution.of.newly.signed.teams', '新签团队分布'),
        url: '/rest/analysis/customer/label/:data_type/sign/team',
        argCallback: paramObj.argCallback,
        chartType: 'bar',
        noShowCondition: {
            callback: () => isSales()
        },
    };
}
