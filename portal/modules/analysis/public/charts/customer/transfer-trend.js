/**
 * 转出客户数趋势
 */

import { argCallbackTimeToUnderlineTime, argCallbackMemberIdToMemberIds } from '../../utils';

export function getCustomerTransferTrendChart() {
    return {
        title: '转出客户数趋势',
        chartType: 'line',
        layout: {sm: 24},
        url: '/rest/analysis/customer/v2/:data_type/customer/transfer_record/trend',
        conditions: [{
            name: 'interval',
            value: 'month',
        }],
        argCallback: arg => {
            argCallbackTimeToUnderlineTime(arg);
            argCallbackMemberIdToMemberIds(arg);

            if (_.get(arg, 'query.app_id')) {
                delete arg.query.app_id;
            }

            if (_.get(arg, 'query.statistics_type')) {
                //这个接口的返回类型参数名为 result_type
                arg.query.result_type = arg.query.statistics_type;
                delete arg.query.statistics_type;
            }
        },
        dataField: 'list',
        processOption: (option, props) => {
            const data = props.data;
            const firstDataItem = _.first(data);

            if (!firstDataItem) return;

            const xAxisData = _.map(firstDataItem.interval_list, 'date_str');

            let legendData = [];
            let series = [];

            _.each(data, dataItem => {
                const name = dataItem.name;
                legendData.push(name);
                series.push({
                    name,
                    type: 'line',
                    data: _.map(dataItem.interval_list, 'number')
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
        processCsvData: chart => {
            let csvData = [];

            const firstItem = _.first(chart.data);

            if (firstItem) {
                let thead = [''];
                const dateCols = _.map(firstItem.interval_list, 'date_str');
                thead = thead.concat(dateCols);
                csvData.push(thead);

                _.each(chart.data, item => {
                    if (item.name) {
                        let tr = [item.name];
                        const valueCols = _.map(item.interval_list, 'number');
                        tr = tr.concat(valueCols);
                        csvData.push(tr);
                    }
                });
            }

            return csvData;
        }
    };
}
