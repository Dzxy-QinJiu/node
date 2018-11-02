/**
 * 团队或个人回款毛利统计
 */

import { processAmountData } from '../../utils';

export function getRepayChart() {
    return {
        title: '团队或个人回款毛利统计',
        url: '/rest/analysis/contract/contract/repay/team/amount',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
            }
        },
        chartType: 'bar',
        processData: processAmountData,
    };
}
