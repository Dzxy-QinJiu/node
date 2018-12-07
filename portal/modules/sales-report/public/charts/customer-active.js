/**
 * 客户活跃度统计
 */

export const customerActiveChart = {
    title: Intl.get('common.customer.active.statistics', '客户活跃度统计'),
    chartType: 'table',
    url: '/rest/analysis/customer/v2/:data_type/customer/active_rate',
    conditions: [
        {
            name: 'interval',
            value: 'day',
        },
    ],
    dataField: 'list',
    option: {
        columns: [
            {
                title: Intl.get('effective.customer.number', '有效客户数'),
                dataIndex: 'valid',
                width: '30%',
            },
            {
                title: Intl.get('active.customer.number', '活跃客户数'),
                dataIndex: 'active',
                width: '30%',
            },
            {
                title: Intl.get('effective.customer.activity.rate', '有效客户活跃率'),
                dataIndex: 'active_rate',
                width: '40%',
                render: text => {
                    return <span>{numToPercent(text)}</span>;
                }
            },
        ],
    },
};

function numToPercent(num) {
    return (num * 100).toFixed(2) + '%';
}
