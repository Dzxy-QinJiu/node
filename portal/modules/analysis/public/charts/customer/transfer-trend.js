/**
 * 转出客户数趋势
 */

export function getCustomerTransferTrendChart() {
    return {
        title: '转出客户数趋势',
        chartType: 'line',
        url: '/rest/analysis/customer/v2/:data_type/customer/transfer_record/trend',
        conditions: [{
            name: 'interval',
            value: 'month',
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
        //processData: data => data.list,
        processData: data => {
            return _.map(data.list, dataItem => {
                return {
                    name: dataItem.date_str,
                    value: dataItem.number,
                };
            });
        },
        /*
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
        */
    };
}
