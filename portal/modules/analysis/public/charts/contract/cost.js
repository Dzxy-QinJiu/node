/**
 * 团队或个人费用统计 
 */

import { processAmountData } from '../../utils';

export function getCostChart() {
    return {
        title: '团队或个人费用统计',
        url: '/rest/analysis/contract/contract/cost/team/amount',
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
