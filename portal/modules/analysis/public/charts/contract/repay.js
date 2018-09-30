/**
 * 新增回款额团队分布
 */

import { processAmountData } from '../../utils';

export function getRepayChart() {
    return {
        title: Intl.get('contract.145', '新增回款额团队分布') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
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
