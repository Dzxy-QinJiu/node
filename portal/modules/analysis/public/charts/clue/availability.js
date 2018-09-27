/**
 * 有效性统计
 */

import { initialTime } from '../../consts';
import { processClueStatisticsData } from '../../utils';

export function getAvailabilityChart() {
    return {
        title: Intl.get('clue.analysis.avalibility.chart', '有效性统计'),
        chartType: 'pie',
        url: '/rest/customer/v2/clue/:data_type/statistical/availability/1000/1',
        reqType: 'post',
        conditions: [{
            type: 'data',
            rangeParamName: 'name',
            value: 'source_time',
        }, {
            type: 'data',
            rangeParamName: 'type',
            value: 'time',
        }, {
            name: 'starttime',
            value: initialTime.start,
            type: 'data',
            rangeParamName: 'from',
        }, {
            name: 'endtime',
            value: initialTime.end,
            type: 'data',
            rangeParamName: 'to',
        }],
        dataField: 'result',
        processData: processClueStatisticsData.bind(this, true),
        option: {
            legend: {
                orient: 'horizontal',
                type: 'scroll',
                x: 'left',
                pageIconSize: 10,
            }
        },
        noExportCsv: true,
    };
}
