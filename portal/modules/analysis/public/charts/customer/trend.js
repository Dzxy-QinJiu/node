/**
 * 趋势统计
 */

export function getCustomerTrendChart(paramObj = {}) {
    return {
        title: paramObj.title || Intl.get('oplate_customer_analysis.1', '趋势统计'),
        url: `/rest/analysis/customer/v1/:auth_type/${paramObj.type}/trend`,
        chartType: 'line',
        customOption: {
            multi: true,
        },
        argCallback: paramObj.argCallback,
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

            //让纵轴数值不出现小数
            _.set(option, 'yAxis[0].minInterval', 1);
        },
        processCsvData: chart => {
            const data = chart.data;
            let csvData = [];

            const firstDataItem = _.first(data);

            if (firstDataItem) {
                const thead = _.map(firstDataItem.data, 'name');

                csvData.push(thead);

                _.each(data, item => {
                    let tr = _.map(item.data, 'value');

                    csvData.push(tr);
                });
            }

            return csvData;
        }
    };
}
