/**
 * 新增合同毛利团队分布
 */

import { processAmountData } from '../../utils';

export function getContractNewChart() {
    return {
        title: Intl.get('contract.144', '新增合同毛利团队分布') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
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
