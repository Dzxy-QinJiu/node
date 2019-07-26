/**
 * 活跃客户趋势
 */

import { numToPercent, argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getCustomerActiveTrendChart(title = '', interval = 'day', isShowIntervalSelector) {
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
                }
            }
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
                        活跃数：${param.value}<br>
                        活跃率：${activeRate}
                        `;
                }
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
        }];
    }

    return chart;
}
