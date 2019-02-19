/**
 * 有效性统计
 */

import { initialTime } from '../../consts';
import { processClueStatisticsData } from '../../utils';

export function getAvailabilityChart() {
    return {
        title: Intl.get('clue.analysis.avalibility.chart', '有效性统计'),
        chartType: 'pie',
        url: '/rest/analysis/customer/v2/clue/:data_type/statistical/field/availability',
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
