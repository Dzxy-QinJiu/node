/**
 * 转出客户数趋势
 */

import { argCallbackTimeToUnderlineTime, argCallbackMemberIdToMemberIds } from '../../utils';

export function getCustomerTransferTrendChart() {
    //当前查询中的时间区间参数值
    let interval;
    
    return {
        title: Intl.get('analysis.trend.of.number.of.customers.transferred.out', '转出客户数趋势'),
        chartType: 'line',
        layout: {sm: 24},
        url: '/rest/analysis/customer/v2/:data_type/customer/transfer_record/trend',
        conditions: [{
            name: 'tranfer_type',
            value: 'out'
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

            //将时间区间参数值暂存下来以供其他回调函数使用
            interval = _.get(arg, 'query.interval');
        },
        dataField: 'list',
        processData: data => {
            //过滤掉没有名字的数据
            return _.filter(data, item => item.name);
        },
        processOption: (option, props) => {
            const data = props.data;
            const firstDataItem = _.first(data);

            if (!firstDataItem) return;

            let xAxisData;

            if (!interval || interval === 'day') {
                xAxisData = _.map(firstDataItem.interval_list, 'date_str');
            } else {
                if (interval === 'week') {
                    //用iso格式的周开始时间，这样是从周一到周天算一周，而不是从周天到周六
                    interval = 'isoweek';
                }

                xAxisData = _.map(firstDataItem.interval_list, item => {
                    const startDate = moment(item.date_str).startOf(interval).format(oplateConsts.DATE_FORMAT);
                    const endDate = moment(item.date_str).endOf(interval).format(oplateConsts.DATE_MONTH_DAY_FORMAT);

                    return `${startDate}${Intl.get('contract.83', '至')}${endDate}`;
                });
            }

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
