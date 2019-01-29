/**
 * 平均在线时长
 */

import { ifNotSingleApp, argCallbackTeamId, argCallbackMemberIdToSalesId } from '../../utils';

export function getAverageOnlineTimeChart(type = 'all') {
    return {
        title: Intl.get('oplate.user.analysis.averageLoginTimes', '平均在线时长'),
        url: '/rest/analysis/user/v3/:auth_type/app/avg/online_time/trend',
        argCallback: arg => {
            argCallbackTeamId(arg);
            argCallbackMemberIdToSalesId(arg);
        },
        conditions: [{
            name: 'interval',
            value: 'hourly',
        }, {
            name: 'analysis_type',
            value: type
        }],
        chartType: 'bar',
        option: {
            tooltip: {
                formatter: params => {
                    const data = params.data;
                    const cardSelectValue = data.cardSelectValue;
                    let name = data.name;

                    if (cardSelectValue === 'hourly') {
                        name = `${name} ${moment(data.timestamp).get('h')}:00`;
                    } else if (cardSelectValue === 'weekly') {
                        name = `${name} - ${moment().format(oplateConsts.DATE_FORMAT)}`;
                    } else if (cardSelectValue === 'monthly') {
                        name = moment(name).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
                    } else if (cardSelectValue === 'quarterly') {
                        name = `${moment(name).format('YYYY年Q')}季度`;
                    } else if (cardSelectValue === 'yearly') {
                        name = `${moment(name).format('YYYY')}年`;
                    }

                    return `
                        ${name}<br>
                        ${Intl.get('common.app.minute', '分钟')}：${moment.duration(data.value).asMinutes().toFixed()}
                    `;
                },
            },
        },
        processOption(option, chartProps) {
            //设置y轴名称，用以标识y轴数值的单位
            _.set(option, 'yAxis[0].name', Intl.get('common.app.minute', '分钟'));

            //时间区间
            const interval = _.get(chartProps, 'cardContainer.selectors[0].activeOption');

            //按小时查看时，横轴显示天和小时
            if (interval === 'hourly') {
                const xAxisData = _.map(chartProps.data, dataItem => {
                    return moment(dataItem.timestamp).format(oplateConsts.DATE_MONTH_DAY_HOUR_MIN_FORMAT);
                });
                _.set(option, 'xAxis[0].data', xAxisData);
            }

            //系列数据
            const serieData = _.get(option, 'series[0].data');

            _.each(serieData, dataItem => {
                //将通话时间转成分钟
                dataItem.value = moment.duration(dataItem.value).asMinutes().toFixed();
            });
        },
        cardContainer: {
            selectors: [{
                options: [
                    {name: Intl.get('common.label.hours', '小时'), value: 'hourly'},
                    {name: Intl.get('common.time.unit.day', '天'), value: 'daily'},
                    {name: Intl.get('common.time.unit.week', '周'), value: 'weekly'},
                    {name: Intl.get('common.time.unit.month', '月'), value: 'monthly'},
                    {name: Intl.get('common.time.unit.quarter', '季度'), value: 'quarterly'},
                    {name: Intl.get('common.time.unit.year', '年'), value: 'yearly'}
                ],
                activeOption: 'hourly',
                conditionName: 'interval',
            }],
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
