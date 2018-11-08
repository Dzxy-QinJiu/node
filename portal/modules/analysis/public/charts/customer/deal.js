/**
 * 成交分析
 */

export function getCustomerDealChart() {
    return {
        title: '成交分析',
        chartType: 'table',
        url: '/rest/analysis/customer/v2/:data_type/last_contact/deal/statistics',
        option: {
            columns: [{
                title: '联系客户数',
                dataIndex: 'total',
            }, {
                title: '成交数',
                dataIndex: 'deal',
            }, {
                title: '未成交数',
                dataIndex: 'no_deal',
            }, {
                title: '成交率',
                dataIndex: 'deal_rate',
            }]
        },
        processData: data => [data.result],
    };
}
