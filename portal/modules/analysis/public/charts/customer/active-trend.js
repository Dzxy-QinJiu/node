/**
 * 活跃客户趋势
 */

import { numToPercent } from '../../utils';

export function getCustomerActiveTrendChart(title = '', interval = 'day') {
    return {
        title,
        chartType: 'line',
        url: '/rest/analysis/customer/label/:data_type/active/trend',
        conditions: [
            {
                name: 'interval',
                value: interval,
            },
        ],
        argCallback: (arg) => {
            let query = arg.query;

            if (query && query.starttime && query.endtime) {
                if (interval === 'day') {
                    query.starttime = moment().subtract(1, 'months').valueOf();
                } else if (interval === 'week') {
                    query.starttime = moment().subtract(3, 'months').valueOf();
                } else if (interval === 'month') {
                    query.starttime = moment().subtract(1, 'years').valueOf();
                }

                query.endtime = moment().valueOf();

            }
        },
    };
}
