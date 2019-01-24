/**
 * 联系客户间隔统计
 */

export function getContactCustomerIntervalChart(intervals) {
    return {
        title: '联系客户间隔统计',
        chartType: 'bar',
        url: '/rest/analysis/customer/v2/customertrace/sale/contact/interval/statistics',
    };
}
