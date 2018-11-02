/**
 * 续签客户趋势
 */

export function getRenewalCustomerTrendChart() {
    return {
        title: '续签客户趋势',
        url: '/rest/analysis/customer/label/:data_type/renewal/rate/trend',
        chartType: 'line',
        conditions: [{
            name: 'interval',
            value: 'month'
        }]
    };
}
