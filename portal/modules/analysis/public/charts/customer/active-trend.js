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
                query.interval = interval;

                if (interval === 'day') {
                    query.starttime = moment(query.endtime).subtract(1, 'months').valueOf();
                } else if (query.endtimeinterval === 'week') {
                    query.starttime = moment(query.endtime).subtract(3, 'months').valueOf();
                } else if (query.endtimeinterval === 'month') {
                    query.starttime = moment(query.endtime).subtract(1, 'years').valueOf();
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
    }

    return chart;
}
