/**
 * 现金流失率
 */

export function getCashLossRateChart(paramObj = {}) {
    return {
        title: Intl.get('analysis.cash.loss.rate', '现金流失率'),
        chartType: 'line',
        customOption: {
            showValueAsPercent: true,
            showYaxisLabelAsPercent: true
        },
        url: '/rest/analysis/customer/label/:data_type/churn/gross/rate/trend',
        argCallback: paramObj.argCallback,
        processData: data => {
            _.each(data, item => {
                item.name = moment(item.timestamp).format(oplateConsts.DATE_FORMAT);
                item.value = item.percent;
            });

            return data;
        }
    };
}
