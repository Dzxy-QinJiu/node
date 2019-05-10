/**
 * 成交率趋势统计
 */

import { num as antUtilNum } from 'ant-utils';

export function getChanceDealTrendChart() {
    return {
        title: '成交率趋势统计',
        chartType: 'line',
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/rate/trend',
        argCallback: arg => {
            const intervalImportant = _.get(arg, 'query.interval_important');

            if (intervalImportant) {
                //用图表自身条件中的interval替换公共条件中的interval
                _.set(arg, 'query.interval', intervalImportant);

                delete arg.query.interval_important;
            }
        },
        processData: data => {
            data = _.get(data, 'result.list');

            return _.map(data, dataItem => {
                dataItem.name = dataItem.date_str;
                dataItem.value = dataItem.deal_rate;

                return dataItem;
            });
        },
        option: {
            tooltip: {
                formatter: params => {
                    const param = _.get(params, '[0]', {});
                    const data = _.get(param, 'data', {});

                    return `
                        ${param.name}<br>
                        成交数: ${data.deal}<br>
                        成交率: ${antUtilNum.decimalToPercent(data.deal_rate)}
                    `;
                }
            },
            yAxis: [{
                axisLabel: {
                    //纵轴刻度值转为百分比
                    formatter: value => {
                        return antUtilNum.decimalToPercent(value);
                    }
                }
            }]
        },
        conditions: [{
            name: 'interval_important',
            value: 'month'
        }],
        cardContainer: {
            selectors: [{
                options: [
                    {name: Intl.get('common.time.unit.week', '周'), value: 'week'},
                    {name: Intl.get('common.time.unit.month', '月'), value: 'month'},
                    {name: Intl.get('common.time.unit.quarter', '季度'), value: 'quarter'},
                    {name: Intl.get('common.time.unit.year', '年'), value: 'year'}
                ],
                activeOption: 'month',
                conditionName: 'interval_important',
            }],
        },
    };
}
