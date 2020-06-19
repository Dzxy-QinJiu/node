/**
 * 订单成交率趋势
 */

export function getOrderTurnoverRateTrendChart() {
    return {
        title: Intl.get('analysis.order.turnover.trend', '订单成交率趋势'),
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/rate/trend',
        chartType: 'line',
        customOption: {
            showValueAsPercent: true,
            showYaxisLabelAsPercent: true
        },
        processData: data => {
            const list = _.get(data, 'result.list');

            return _.map(list, item => {
                return {
                    name: item.date_str,
                    value: item.deal_rate
                };
            });
        }
    };
}
