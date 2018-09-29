/**
 * 趋势统计
 */

export function getCustomerTrendChart(type = 'total') {
    return {
        title: Intl.get('oplate_customer_analysis.1', '趋势统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${type}/trend`,
        chartType: 'line',
        customOption: {
            multi: true,
        },
        processOption: option => {
            let allData = [];

            //集合各系列中的数据
            _.each(option.series, serie => {
                if (_.isArray(serie.data)) {
                    allData = allData.concat(serie.data);
                }
            });

            //找出最小值
            const minValue = _.min(allData);

            //将y轴最小值设置为数据最小值，以解决数据变化过小，看不出趋势的问题
            if (minValue) {
                _.set(option, 'yAxis[0].min', minValue);
            }
        },
    };
}
