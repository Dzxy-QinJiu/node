/**
 * 流失客户地域分析
 */

export function getLossCustomerZoneChart() {
    return {
        title: '流失客户地域分析',
        chartType: 'bar',
        url: '/rest/analysis/customer/label/:data_type/churn/region',
    };
}
