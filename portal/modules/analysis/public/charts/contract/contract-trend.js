/**
 * 近3个月新增合同周趋势图
 */

import { processAmountData } from '../../utils';
import { argCallbackUnderlineTimeToTime } from '../../utils';

export function getContractTrendChart() {
    return {
        title: Intl.get('contract.147', '近3个月新增合同周趋势图') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.139', '万') + ')',
        url: '/rest/analysis/contract/contract/count/trend',
        argCallback: (arg) => {
            argCallbackUnderlineTimeToTime(arg);

            const query = arg.query;

            if (query) {
                query.starttime = moment().subtract(3, 'month').valueOf();
                query.endtime = moment().valueOf();
            }
        },
        processData: processAmountData,
        chartType: 'line',
    };
}
