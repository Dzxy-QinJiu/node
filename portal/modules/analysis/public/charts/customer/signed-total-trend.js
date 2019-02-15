/**
 * 签约客户总体趋势
 */

export function getSignedCustomerTotalTrendChart(paramObj = {}) {
    return {
        title: '签约客户总体趋势',
        url: '/rest/analysis/customer/label/:data_type/sign/total/trend',
        argCallback: paramObj.argCallback,
        chartType: 'line',
        conditions: [{
            name: 'interval',
            value: 'month'
        }]
    };
}
