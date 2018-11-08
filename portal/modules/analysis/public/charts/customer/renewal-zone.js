/**
 * 续签客户地域分析
 */

export function getRenewalCustomerZoneChart() {
    return {
        title: '续签客户地域分析',
        chartType: 'bar',
        url: '/rest/analysis/customer/label/:data_type/renewal/region',
    };
}
