/**
 * 近3个月回款周趋势图
 */

import { processAmountData } from '../../utils';

export function getRepayTrendChart() {
    return {
        title: Intl.get('contract.146', '近3个月回款周趋势图') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
        url: '/rest/analysis/contract/contract/repay/trend',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                query.starttime = moment().subtract(3, 'month').valueOf();
                query.endtime = moment().valueOf();
                delete query.app_id;
            }
        },
        processData: processAmountData,
        chartType: 'line',
    };
}
