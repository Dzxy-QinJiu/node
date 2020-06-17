/**
 * 续签客户趋势
 */

export function getRenewalCustomerTrendChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.renewal.customer.trend', '续签客户趋势'),
        url: '/rest/analysis/customer/label/:data_type/renewal/rate/trend',
        argCallback: paramObj.argCallback,
        chartType: 'line',
    };
}
