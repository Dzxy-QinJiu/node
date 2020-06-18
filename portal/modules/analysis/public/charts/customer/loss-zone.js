/**
 * 流失客户地域分析
 */

export function getLossCustomerZoneChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.regional.analysis.of.lost.customers', '流失客户地域分析'),
        chartType: 'bar',
        url: '/rest/analysis/customer/label/:data_type/churn/region',
        argCallback: paramObj.argCallback,
    };
}
