/**
 * 客户续签时间统计
 */

export function getRenewalCustomerTimeChart() {
    return {
        title: '客户续签时间统计',
        url: '/rest/analysis/customer/label/:data_type/renewal/time',
        chartType: 'bar',
    };
}
