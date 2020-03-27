/**
 * 平均在线时长
 */

import { ifNotSingleApp, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToSalesId } from '../../utils';

export function getAverageOnlineTimeChart(type = 'all') {
    let queryCache = {};

    return {
        title: Intl.get('oplate.user.analysis.averageLoginTimes', '平均在线时长'),
        url: '/rest/analysis/user/v3/:auth_type/app/avg/online_time/trend',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToSalesId(arg);

            let { query } = arg;
            const { interval_important } = query;

            if (interval_important) {
                //用图表自身条件中的interval替换公共条件中的interval
                query.interval = interval_important;

                delete query.interval_important;
            } else {
                //转换成接口需要的带ly后缀的格式，如 day 转成 daily，week 转成 weekly
                query.interval = query.interval.replace(/y$/, 'i').replace(/$/, 'ly');
            }

            queryCache = query;
        },
        conditions: [{
            name: 'interval_important',
            value: '',
        }, {
            name: 'analysis_type',
            value: type
        }],
        chartType: 'bar',
        option: {
            tooltip: {
                formatter: params => {
                    const { interval } = queryCache;
                    let { name, value } = params.data;

                    switch(interval) {
                        case 'weekly':
                            name = `${name} - ${moment().format(oplateConsts.DATE_FORMAT)}`;
                            break;
                        case 'monthly':
                            name = moment(name).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
                            break;
                        case 'quarterly':
                            name = `${moment(name).format('YYYY年Q')}季度`;
                            break;
                        case 'yearly':
                            name = `${moment(name).format('YYYY')}年`;
                            break;
                    }

                    return `
                        ${name}<br>
                        ${Intl.get('common.app.minute', '分钟')}：${value}
                    `;
                },
            },
        },
        processData: (data, chart) => {
            const { interval } = queryCache;
            let intervalSelector = _.get(chart, 'cardContainer.selectors[0]');
            _.set(intervalSelector, 'activeOption', interval);

            _.each(data, dataItem => {
                dataItem.name = moment(dataItem.timestamp).format(oplateConsts.DATE_FORMAT);
                //将通话时间转成分钟
                dataItem.value = moment.duration(dataItem.value).asMinutes().toFixed();
            });

            return data;
        },
        processOption(option) {
            //设置y轴名称，用以标识y轴数值的单位
            _.set(option, 'yAxis[0].name', Intl.get('common.app.minute', '分钟'));
        },
        cardContainer: {
            selectors: [{
                options: [
                    {name: Intl.get('common.time.unit.day', '天'), value: 'daily'},
                    {name: Intl.get('common.time.unit.week', '周'), value: 'weekly'},
                    {name: Intl.get('common.time.unit.month', '月'), value: 'monthly'},
                    {name: Intl.get('common.time.unit.quarter', '季度'), value: 'quarterly'},
                    {name: Intl.get('common.time.unit.year', '年'), value: 'yearly'}
                ],
                activeOption: '',
                conditionName: 'interval_important',
            }],
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
