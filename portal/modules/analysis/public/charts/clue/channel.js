/**
 * 渠道统计
 */

import { initialTime } from '../../consts';
import { processClueStatisticsData } from '../../utils';

export function getChannelChart() {
    return {
        title: Intl.get('clue.analysis.access.chart', '渠道统计'),
        chartType: 'pie',
        url: '/rest/customer/v2/clue/:data_type/statistical/access_channel/1000/1',
        reqType: 'post',
        conditions: [{
            type: 'data',
            value: 'source_time',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].name', value);
            }
        }, {
            type: 'data',
            value: 'time',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].type', value);
            }
        }, {
            name: 'starttime',
            value: initialTime.start,
            type: 'data',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].from', value);
            }
        }, {
            name: 'endtime',
            value: initialTime.end,
            type: 'data',
            callback: (data, name, value) => {
                _.set(data, 'rang_params[0].to', value);
            }
        }],
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
        noExportCsv: true,
        customOption: {
            stack: false,
            multi: true,
            serieNameField: 'clueName',
        },
    };
}
