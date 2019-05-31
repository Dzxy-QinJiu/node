/**
 * 114占比统计
 */

import { isCommonSales, get114RatioAndServiceTelProcessDataFunc, get114RatioAndServiceTelProcessOptionFunc } from '../../utils';

export function getCall114RatioChart() {
    let chart = {
        title: Intl.get('call.record.service.phone.rate', '114占比统计'),
        chartType: isCommonSales() ? 'pie' : 'bar',
        url: '/rest/analysis/callrecord/v1/callrecord/term/invailid',
        conditions: [{
            name: 'filter_phone',
            value: true
        }, {
            name: 'filter_invalid_phone',
            value: false
        }],
        processData: get114RatioAndServiceTelProcessDataFunc('114'),
        processOption: get114RatioAndServiceTelProcessOptionFunc(),
    };

    if (!isCommonSales()) {
        chart.customOption = {
            showValueAsPercent: true,
            showYaxisLabelAsPercent: true
        };
    }

    return chart;
}
