/**
 * 成交分析
 */

import { argCallbackUnderlineTimeToTime } from '../../utils';

export function getCustomerDealChart() {
    return {
        title: '成交分析',
        chartType: 'table',
        url: '/rest/analysis/customer/v2/:data_type/last_contact/deal/statistics',
        argCallback: argCallbackUnderlineTimeToTime,
        option: {
            columns: [{
                title: '联系客户数',
                dataIndex: 'total',
                width: '25%',
            }, {
                title: '成交数',
                dataIndex: 'deal',
                width: '25%',
            }, {
                title: '未成交数',
                dataIndex: 'no_deal',
                width: '25%',
            }, {
                title: '成交率',
                dataIndex: 'deal_rate',
                width: '25%',
            }]
        },
        processData: data => [data.result],
    };
}
