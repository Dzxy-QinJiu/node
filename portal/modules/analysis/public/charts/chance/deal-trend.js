/**
 * 成交率趋势统计
 */

import { num as antUtilNum } from 'ant-utils';

export function getChanceDealTrendChart() {
    return {
        title: Intl.get('analysis.transaction.trend.statistics', '成交趋势统计'),
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
        processData: (data, chart) => {
            data = _.get(data, 'result.list');

            const intervalCondition = _.find(chart.conditions, item => item.name === 'interval_important');
            let interval = _.get(intervalCondition, 'value');

            return _.map(data, dataItem => {
                if (interval) {
                    if (interval === 'week') {
                        //用iso格式的周开始时间，这样是从周一到周天算一周，而不是从周天到周六
                        interval = 'isoweek';
                    }

                    const startDate = moment(dataItem.date_str).startOf(interval).format(oplateConsts.DATE_FORMAT);
                    const endDate = moment(dataItem.date_str).endOf(interval).format(oplateConsts.DATE_MONTH_DAY_FORMAT);

                    dataItem.name = `${startDate}${Intl.get('contract.83', '至')}${endDate}`;
                } else {
                    dataItem.name = dataItem.date_str;
                }

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
                        ${Intl.get('common.deal.number', '成交数')} : ${data.deal}<br>
                        ${Intl.get('common.deal.rate', '成交率')} : ${antUtilNum.decimalToPercent(data.deal_rate)}
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
