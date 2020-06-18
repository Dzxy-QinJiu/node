/**
 * 活跃客户趋势
 */

import { numToPercent, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getCustomerActiveTrendChart(title = '', interval = 'day', isShowIntervalSelector) {
    //查询参数中的结束时间
    let endTime;
    //查询的时间区间值
    //默认用传进来的，在显示时间区间切换按钮的情况下，切换按钮时该值会按选择的值进行赋值
    let intervalValue = interval;

    let chart = {
        title,
        chartType: 'line',
        url: '/rest/analysis/customer/label/:data_type/active/trend',
        argCallback: arg => {
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
            argCallbackUnderlineTimeToTime(arg);

            let query = arg.query;

            if (query) {
                //将查询参数中的结束时间记录下来以供其他回调函数使用
                endTime = query.endtime;

                //不显示时间区间切换按钮时
                if (!isShowIntervalSelector) {
                    //使用传入的时间区间，
                    query.interval = interval;

                    //查看日活时
                    if (interval === 'day') {
                        //查询结束时间前推一个月的数据
                        query.starttime = moment(query.endtime).subtract(1, 'months').valueOf();
                    //查看周活时
                    } else if (interval === 'week') {
                        //查询结束时间前推三个月的数据
                        query.starttime = moment(query.endtime).subtract(3, 'months').valueOf();
                    //查看月活时
                    } else if (interval === 'month') {
                        //查询结束时间前推一年的数据
                        query.starttime = moment(query.endtime).subtract(1, 'years').valueOf();
                    }
                } else {
                    //将查询参数中的时间区间值保存下来，以供其他回调函数使用
                    intervalValue = query.interval;
                }
            }
        },
        processData: data => {
            _.each(data, dataItem => {
                //若查询的时间区间值有值
                if (intervalValue) {
                    if (intervalValue === 'day') {
                        dataItem.name = moment(dataItem.timestamp).format(oplateConsts.DATE_FORMAT);
                    //时间区间查询参数不是天时，日期列显示为 xxxx-xx-xx至xxxx-xx-xx 的格式
                    } else {
                        if (intervalValue === 'week') {
                            //用iso格式的周开始时间，这样是从周一到周天算一周，而不是从周天到周六
                            intervalValue = 'isoweek';
                        }

                        const startDate = moment(dataItem.timestamp).startOf(intervalValue).format(oplateConsts.DATE_FORMAT);

                        //结束时间moment对象
                        //初始值为根据当前数据点所在的时间戳按指定的时间区间计算出来的结束时间的moment
                        let endMoment = moment(dataItem.timestamp).endOf(intervalValue);

                        //如果初始值为根据当前数据点所在的时间戳按指定的时间区间计算出来的结束时间大于查询参数中的结束时间
                        if (endMoment.valueOf() > endTime) {
                            //则根据查询参数中的结束时间设置结束时间moment对象
                            endMoment = moment(endTime);
                        }

                        const endDate = endMoment.format(oplateConsts.DATE_MONTH_DAY_FORMAT);

                        dataItem.name = `${startDate}${Intl.get('contract.83', '至')}${endDate}`;
                    }
                }
            });

            return data;
        },
        option: {
            tooltip: {
                formatter: params => {
                    const param = params[0];
                    //活跃率，接口有可能不返回，此时设默认值为0
                    const percent = param.data.percent || 0;
                    const activeRate = (percent * 100).toFixed() + '%';

                    return `
                        ${param.name}<br>
                        ${Intl.get('operation.report.active.num', '活跃数')} : ${param.value}<br>
                        ${Intl.get('operation.report.active', '活跃率')} : ${activeRate}
                        `;
                }
            },
            yAxis: [{
                //让纵轴数值不出现小数
                minInterval: 1
            }],
            grid: {
                //左边距设大一些，以便横轴标签显示为 xxxx-xx-xx至xxxx-xx-xx 格式时第一个标签能显示全
                left: 20
            }
        }
    };

    if (isShowIntervalSelector) {
        chart.cardContainer = {
            operateButtons: [{value: 'day', name: Intl.get('operation.report.day.active', '日活')},
                {value: 'week', name: Intl.get('operation.report.week.active', '周活')},
                {value: 'month', name: Intl.get('operation.report.month.active', '月活')}],
            activeButton: 'day',
            conditionName: 'interval',
        };

        chart.conditions = [{
            name: 'interval',
            value: 'day',
        }];
    }

    return chart;
}
