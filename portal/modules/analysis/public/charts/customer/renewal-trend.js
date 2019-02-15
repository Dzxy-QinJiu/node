/**
 * 续签客户趋势
 */

export function getRenewalCustomerTrendChart(paramObj = {}) {
    return {
        title: '续签客户趋势',
        url: '/rest/analysis/customer/label/:data_type/renewal/rate/trend',
        argCallback: paramObj.argCallback,
        chartType: 'line',
        conditions: [{
            name: 'interval',
            value: 'month'
        }]
    };
}
