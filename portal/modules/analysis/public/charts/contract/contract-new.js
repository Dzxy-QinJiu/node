/**
 * 团队或个人统计
 */

import { processAmountData } from '../../utils';

export function getContractNewChart() {
    return {
        title: '团队或个人统计',
        url: '/rest/analysis/contract/contract/gross_profit/team',
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
