/**
 * 试用合格趋势统计
 */

export function getCustomerTrialQualifiedTrendChart(type) {
    let chart = {
        title: Intl.get('analysis.trial.qualified.customer.trend.chart', '试用合格客户趋势图'),
        chartType: 'line',
        layout: {sm: 24},
        url: '/rest/analysis/customer/v2/:data_type/trial/qualify/trend',
        conditions: [{
            name: 'interval_important',
            value: 'month',
        }, {
            name: 'label',
            value: Intl.get('common.trial.qualified', '试用合格'),
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

            const { interval_important } = query;

            if (interval_important) {
                //用图表自身条件中的interval替换公共条件中的interval
                query.interval = interval_important;

                delete query.interval_important;
            }
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
        },
        cardContainer: {
            selectors: [{
                options: [
                    {name: Intl.get('common.time.unit.week', '周'), value: 'week'},
                    {name: Intl.get('common.time.unit.month', '月'), value: 'month'},
                ],
                activeOption: 'month',
                conditionName: 'interval_important',
            }],
        },
    };

    if (type === 'new') {
        chart.title = Intl.get('analysis.new.trial.qualified.customer.trend.chart', '新增试用合格客户趋势图');

        let { conditions } = chart;

        if (conditions) {
            conditions.push({
                name: 'qualify_type',
                value: 'new',
            });
        }

        let options = _.get(chart, 'cardContainer.selectors[0].options');

        if (options) {
            options.unshift(
                {name: Intl.get('common.time.unit.day', '天'), value: 'day'}
            );

            options.push(
                {name: Intl.get('common.time.unit.quarter', '季度'), value: 'quarter'},
                {name: Intl.get('common.time.unit.year', '年'), value: 'year'}
            );
        }
    }

    return chart;
}
