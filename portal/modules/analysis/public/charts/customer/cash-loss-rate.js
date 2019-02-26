/**
 * 现金流失率
 */

export function getCashLossRateChart(paramObj = {}) {
    return {
        title: '现金流失率',
        chartType: 'line',
        url: '/rest/analysis/customer/label/:data_type/churn/gross/rate/trend',
        argCallback: paramObj.argCallback,
        conditions: [{
            name: 'interval',
            value: 'month'
        }],
        processData: data => {
            _.each(data, item => {
                item.name = moment(item.timestamp).format(oplateConsts.DATE_FORMAT);
                item.value = item.percent;
            });

            return data;
        }
    };
}
