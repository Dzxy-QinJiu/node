/**
 * 流失现金趋势
 */

export function getLossCashTrendChart() {
    return {
        title: '流失现金趋势',
        chartType: 'line',
        url: '/rest/analysis/customer/label/:data_type/churn/gross/trend',
        conditions: [{
            name: 'interval',
            value: 'month'
        }],
        valueField: 'churn_gross_profit',
    };
}
