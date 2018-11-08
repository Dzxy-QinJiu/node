/**
 * 流失客户趋势
 */

export function getLossCustomerTrendChart() {
    return {
        title: '流失客户趋势',
        chartType: 'line',
        url: '/rest/analysis/customer/label/:data_type/churn/customer/trend',
        conditions: [{
            name: 'interval',
            value: 'month'
        }]
    };
}
