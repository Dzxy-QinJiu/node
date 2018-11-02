/**
 * 新签客户趋势
 */

export function getSignedCustomerNewTrendChart() {
    return {
        title: '新签客户趋势',
        url: '/rest/analysis/customer/label/:data_type/sign/trend',
        chartType: 'line',
        conditions: [{
            name: 'interval',
            value: 'month'
        }]
    };
}
