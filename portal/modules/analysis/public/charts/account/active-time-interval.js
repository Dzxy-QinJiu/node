/**
 * 活跃时间段
 */

import { WEEKDAY } from '../../consts';
import { ifNotSingleApp, argCallbackUnderlineTimeToTime } from '../../utils';

export function getActiveTimeIntervalChart() {
    return {
        title: Intl.get('oplate.user.analysis.10', '活跃时间段'),
        url: '/rest/analysis/user/v3/app/operations/weekly',
        argCallback: argCallbackUnderlineTimeToTime,
        chartType: 'scatter',
        option: {
            tooltip: {
                formatter: params => {
                    const name = WEEKDAY[params.seriesIndex];
                    const data = params.data;
                    return `
                        ${name}${data[0]}${Intl.get('crm.75', ' 点')}<br>
                        ${Intl.get('oplate.user.analysis.29', '操作数')}：${data[1]}
                    `;
                },
            },
        },
        xAxisLabels: _.range(24),
        yAxisLabels: WEEKDAY,
        processCsvData: function(chart) {
            const data = chart.data;
            let csvData = [];
            let thead = [Intl.get('common.login.time', '时间')];
            _.each(_.range(24), hour => {
                thead.push(hour + Intl.get('crm.75', ' 点'));
            });
            csvData.push(thead);

            const weekData = _.groupBy(data, dataItem => dataItem.week);
            _.each(weekData, (weekDataItem, index) => {
                let tr = _.map(weekDataItem, 'count');
                tr.unshift(WEEKDAY[index]);
                csvData.push(tr);
            });
            return csvData;
        },
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
