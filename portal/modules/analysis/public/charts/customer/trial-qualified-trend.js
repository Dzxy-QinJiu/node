/**
 * 试用合格趋势统计
 */

export function getCustomerTrialQualifiedTrendChart() {
    return {
        title: '趋势图',
        chartType: 'line',
        layout: {sm: 24},
        url: '/rest/analysis/customer/v2/:data_type/trial/qualify/trend',
        conditions: [{
            name: 'label',
            value: '试用合格',
        }],
        argCallback: arg => {
            let query = arg.query;

            if (query && query.start_time && query.end_time) {
                query.start_time = moment(query.end_time).subtract(1, 'years').valueOf();
            }

            if (query.statistics_type) {
                //老接口里用的是result_type来区分返回类型
                query.result_type = query.statistics_type;
                delete query.statistics_type;
            }

            query.interval = 'month';
        },
        dataField: 'list',
        processOption: (option, props) => {
            const data = props.data;
            const firstDataItem = _.first(data);

            if (!firstDataItem) return;

            const xAxisData = _.map(firstDataItem.interval, 'date_str');

            let legendData = [];
            let series = [];

            _.each(data, dataItem => {
                const name = dataItem.name;
                legendData.push(name);
                series.push({
                    name,
                    type: 'line',
                    data: _.map(dataItem.interval, 'count')
                });
            });

            option.xAxis[0].data = xAxisData;
            option.legend = {
                type: 'scroll',
                pageIconSize: 10,
                data: legendData
            };
            option.series = series;
        },
        processCsvData: (chart, option) => {
            let csvData = [];

            let thead = _.clone(_.get(option, 'xAxis[0].data', []));
            thead.unshift('');

            csvData.push(thead);

            _.each(option.series, serie => {
                let tr = _.clone(serie.data);
                tr.unshift(serie.name);

                csvData.push(tr);
            });

            return csvData;
        }
    };
}
