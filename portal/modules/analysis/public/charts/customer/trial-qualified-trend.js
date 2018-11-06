/**
 * 试用合格趋势统计
 */

export function getCustomerTrialQualifiedTrendChart() {
    return {
        title: '趋势图',
        chartType: 'line',
        url: '/rest/analysis/customer/v2/:data_type/trial/qualify/trend',
        conditions: [{
            name: 'interval',
            value: 'month',
        }, {
            name: 'label',
            value: '试用合格',
        }],
        argCallback: arg => {
            let query = arg.query;

            if (query && query.starttime && query.endtime) {
                query.start_time = query.starttime;
                query.end_time = query.endtime;
                delete query.starttime;
                delete query.endtime;
            }

            if (query.member_id) {
                query.member_ids = query.member_id;
                delete query.member_id;
            }


            delete query.app_id;
        },
        processData: data => data.list,
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
        }
    };
}
