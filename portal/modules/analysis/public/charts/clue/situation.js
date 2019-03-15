/**
 * 线索渠道、来源、分类情况统计
 */

import { processClueStatisticsData } from '../../utils';

export function getClueSituationChart(paramObj = {}) {
    return {
        title: paramObj.title,
        chartType: 'bar_pie',
        url: `/rest/analysis/customer/v2/clue/:data_type/statistical/field/${paramObj.field}`,
        dataField: 'result',
        processData: processClueStatisticsData.bind(this, false),
        option: {
            legend: {
                orient: 'horizontal',
                type: 'scroll',
                x: 'left',
                pageIconSize: 10,
            }
        },
        customOption: {
            proportion: 0.6,
            pieLabelLength: 8
        },
        noExportCsv: true,
    };
}
