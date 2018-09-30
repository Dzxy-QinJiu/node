/**
 * 新增费用额团队分布
 */

import { processAmountData } from '../../utils';

export function getCostChart() {
    return {
        title: Intl.get('contract.149', '新增费用额团队分布') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
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
