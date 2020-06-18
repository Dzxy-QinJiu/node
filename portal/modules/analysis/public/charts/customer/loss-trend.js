/**
 * 流失客户趋势
 */

export function getLossCustomerTrendChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.customer.churn.trend', '流失客户趋势'),
        chartType: 'line',
        url: '/rest/analysis/customer/label/:data_type/churn/customer/trend',
        argCallback: paramObj.argCallback,
    };
}
