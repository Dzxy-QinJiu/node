/**
 * 客户流失率统计
 */

import { argCallbackUnderlineTimeToTime, argCallbackMemberIdsToMemberId } from '../../utils';

export function getCustomerLoseRateChart() {
    return {
        title: '客户流失率统计',
        chartType: 'table',
        url: '/rest/analysis/customer/label/:data_type/churn/team',
        argCallback: arg => {
            argCallbackMemberIdsToMemberId(arg);
            argCallbackUnderlineTimeToTime(arg);
        },
        option: {
            columns: [{
                title: '流失客户数',
                dataIndex: 'count',
                width: '25%'
            }, {
                title: '客户流失率',
                dataIndex: 'count_percent',
                render: value => <span>{value * 100 + '%'}</span>,
                width: '25%'
            }, {
                title: '流失毛利',
                dataIndex: 'gross_profit',
                width: '25%'
            }, {
                title: '毛利流失率',
                dataIndex: 'gross_profit_percent',
                render: value => <span>{value * 100 + '%'}</span>,
                width: '25%'
            }]
        }
    };
}
