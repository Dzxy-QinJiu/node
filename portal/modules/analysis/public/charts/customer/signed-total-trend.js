/**
 * 签约客户总体趋势
 */

export function getSignedCustomerTotalTrendChart() {
    return {
        title: '签约客户总体趋势',
        url: '/rest/analysis/customer/label/:data_type/sign/total/trend',
        chartType: 'line',
        conditions: [{
            name: 'interval',
            value: 'month'
        }]
    };
}
