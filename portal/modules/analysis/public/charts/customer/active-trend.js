/**
 * 近一月活跃客户趋势
 */

import { numToPercent } from '../../utils';

export function getCustomerActiveTrendChart() {
    return {
        title: Intl.get('active.customer.trends.last.month', '近一月活跃客户趋势'),
        url: '/rest/analysis/customer/v2/:data_type/customer/active_rate',
        argCallback: (arg) => {
            let query = arg.query;

            if (query && query.starttime && query.endtime) {
                query.start_time = moment().subtract(1, 'months').valueOf();
                query.end_time = moment().valueOf();
                delete query.starttime;
                delete query.endtime;
            }
        },
        conditions: [
            {
                name: 'interval',
                value: 'day',
            },
        ],
        chartType: 'line',
        dataField: 'total',
        processData: data => {
            _.each(data, dataItem => {
                if (dataItem.date_str) {
                    dataItem.name = dataItem.date_str.substr(5);
                    dataItem.value = dataItem.active;
                }
            });

            return data;
        },
        option: {
            grid: {
                right: 0,
            },
            tooltip: {
                formatter: params => {
                    const dateStr = params[0].name;
                    const activeNum = params[0].value;
                    const activeRate = numToPercent(params[0].data.active_rate);
                    const effectiveNum = params[0].data.valid;

                    return `
                        ${dateStr}<br>
                        ${Intl.get('active.customer.number', '活跃客户数')}: ${activeNum}<br>
                        ${Intl.get('effective.customer.activity.rate', '有效客户活跃率')}: ${activeRate}<br>
                        ${Intl.get('effective.customer.number', '有效客户数')}: ${effectiveNum}
                    `;
                },
            },
        },
    };
}
