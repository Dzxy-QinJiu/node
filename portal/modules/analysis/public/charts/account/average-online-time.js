/**
 * 平均在线时长
 */

import { ifNotSingleApp, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToSalesId } from '../../utils';

export function getAverageOnlineTimeChart(type = 'all') {
    return {
        title: Intl.get('oplate.user.analysis.averageLoginTimes', '平均在线时长'),
        url: '/rest/analysis/user/v3/:auth_type/app/avg/online_time/trend',
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToSalesId(arg);

            const intervalImportant = _.get(arg, 'query.interval_important');

            if (intervalImportant) {
                //用图表自身条件中的interval替换公共条件中的interval
                _.set(arg, 'query.interval', intervalImportant);

                delete arg.query.interval_important;
            }
        },
        conditions: [{
            name: 'interval_important',
            value: 'daily',
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

                    if (cardSelectValue === 'weekly') {
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
                        ${Intl.get('common.app.minute', '分钟')}：${data.value}
                    `;
                },
            },
        },
        processOption(option, chartProps) {
            //设置y轴名称，用以标识y轴数值的单位
            _.set(option, 'yAxis[0].name', Intl.get('common.app.minute', '分钟'));

            //时间区间
            const interval = _.get(chartProps, 'cardContainer.selectors[0].activeOption');

            //系列数据
            const serieData = _.get(option, 'series[0].data');

            _.each(serieData, dataItem => {
                //将通话时间转成分钟
                dataItem.value = moment.duration(dataItem.value).asMinutes().toFixed();
                //在数据中标识当前统计的时间区间
                dataItem.cardSelectValue = interval;
            });
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
                activeOption: 'daily',
                conditionName: 'interval_important',
            }],
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
