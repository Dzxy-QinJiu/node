/**
 * 线索成交额及成交数统计
 */

import { argCallbackMemberIdToIds, argCallbackTimeToUnderlineTime } from '../../utils';

export function getClueDealChart() {
    return {
        title: '线索成交额及成交数统计',
        chartType: 'line',
        url: '/rest/analysis/customer/v2/clue/:data_type/sign/contract/amount',
        argCallback: (arg) => {
            argCallbackTimeToUnderlineTime(arg);
            argCallbackMemberIdToIds(arg);
        },
        dataField: 'list',
        nameField: 'date_str',
        valueField: 'date_list_num',
        option: {
            tooltip: {
                formatter: params => {
                    return `
                        ${params[0].name}<br>
                        成交数：${params[0].value}<br>
                        成交额：${params[0].data.date_gross_profit_total}
                    `;
                }
            }
        }
    };
}
