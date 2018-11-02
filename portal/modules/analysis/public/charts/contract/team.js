/**
 * 团队分布及完成率
 */

import { isSales } from '../../consts';
import { processAmountData } from '../../utils';

export function getContractTeamChart() {
    return {
        title: '团队分布及完成率(假数据)',
        url: '/rest/analysis/contract/contract/gross_profit/team',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
            }
        },
        chartType: 'bar',
        processData: processAmountData,
        noShowCondition: {
            callback: () => isSales
        },
    };
}
