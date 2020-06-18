/**
 * 新签客户趋势
 */

export function getSignedCustomerNewTrendChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.new.customer.trend', '新签客户趋势'),
        url: '/rest/analysis/customer/label/:data_type/sign/trend',
        argCallback: paramObj.argCallback,
        chartType: 'line',
    };
}
